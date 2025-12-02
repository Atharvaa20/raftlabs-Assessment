import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the AITool interface to match our existing structure
interface AITool {
  id: string;
  name: string;
  description: string;
  category: string[];
  emoji?: string;
  pricing: {
    type: 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing';
    price?: string;
  };
  website: string;
  logo: string;
  features: string[];
  launchDate: string;
  rating?: number;
}

// Text cleaning will be done inside the page.evaluate context

// Function to extract price type from text
const getPricingType = (text: string): 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing' => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('free') && lowerText.includes('paid')) return 'Freemium';
  if (lowerText.includes('free')) return 'Free';
  if (lowerText.includes('contact')) return 'Contact for Pricing';
  return 'Paid';
};

// Function to extract price if available
const extractPrice = (text: string): string | undefined => {
  const priceMatch = text.match(/\$[0-9]+(\.[0-9]{2})?(\/month|\/year)?/);
  return priceMatch ? priceMatch[0] : undefined;
};

// Main scraping function
async function scrapeAITools() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the main page
    await page.goto('https://theresanaiforthat.com/ai-directory/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Get all tool links from the directory
    const toolLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/ai/"]'));
      return links.map(link => (link as HTMLAnchorElement).href);
    });

    const uniqueToolLinks = [...new Set(toolLinks)];
    console.log(`Found ${uniqueToolLinks.length} tools to scrape`);

    const aiTools: AITool[] = [];
    const maxTools = 50; // Limit for testing, remove or increase for production

    for (let i = 0; i < Math.min(uniqueToolLinks.length, maxTools); i++) {
      const toolUrl = uniqueToolLinks[i];
      console.log(`Scraping ${i + 1}/${Math.min(uniqueToolLinks.length, maxTools)}: ${toolUrl}`);
      
      try {
        await page.goto(toolUrl, {
          waitUntil: 'networkidle2',
          timeout: 60000,
        });

        const toolData = await page.evaluate(() => {
          // Define cleanText inside the browser context
          const cleanText = (text: string | null | undefined): string => {
            if (!text) return '';
            return text
              .replace(/\s+/g, ' ')
              .trim()
              .replace(/\n/g, '');
          };

          // Extract basic information
          const name = cleanText(document.querySelector('h1')?.textContent);
          const description = cleanText(document.querySelector('.ai-desc')?.textContent);
          const website = (document.querySelector('a[href^="http"].website-button') as HTMLAnchorElement)?.href || '';
          
          // Extract categories
          const categories = Array.from(document.querySelectorAll('.ai-categories a')).map(el => 
            el.textContent?.trim() || ''
          ).filter(Boolean);
          
          // Extract pricing
          const pricingText = document.querySelector('.ai-pricing')?.textContent?.trim() || '';
          
          // Extract features
          const features = Array.from(document.querySelectorAll('.ai-features li')).map(el => 
            el.textContent?.trim() || ''
          ).filter(Boolean);
          
          // Extract rating if available
          const ratingElement = document.querySelector('.ai-rating');
          const rating = ratingElement ? parseFloat(ratingElement.textContent?.trim() || '0') : undefined;
          
          // Extract launch date (if available)
          const launchDate = new Date().toISOString().split('T')[0]; // Default to today
          
          // Generate a simple ID from the name
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          
          // Determine pricing type
          let pricingType: 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing' = 'Paid';
          const pricingTextLower = pricingText.toLowerCase();
          
          if (pricingTextLower.includes('free') && pricingTextLower.includes('paid')) {
            pricingType = 'Freemium';
          } else if (pricingTextLower.includes('free')) {
            pricingType = 'Free';
          } else if (pricingTextLower.includes('contact')) {
            pricingType = 'Contact for Pricing';
          }
          
          // Create the tool data with proper typing
          const toolData: AITool = {
            id,
            name: cleanText(name),
            description: cleanText(description),
            category: categories,
            pricing: {
              type: pricingType,
              price: extractPrice(description) || undefined,
            },
            website,
            logo: `https://logo.clearbit.com/${new URL(website).hostname.replace('www.', '')}`,
            features,
            launchDate,
            rating,
          };
          
          return toolData;
        });

        aiTools.push(toolData);
        
        // Add a small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scraping ${toolUrl}:`, error);
      }
    }

    // Save the scraped data to a file
    const outputPath = path.join(__dirname, '../src/data/aiTools.ts');
    const fileContent = `// Auto-generated by scripts/scraper.ts
// Last updated: ${new Date().toISOString()}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string[];

export const aiTools: AITool[] = ${JSON.stringify(aiTools, null, 2)};`;

    try {
      await fs.writeFile(outputPath, fileContent);
      console.log(`Successfully scraped ${aiTools.length} tools and saved to ${outputPath}`);
    } catch (writeError) {
      console.error('Error writing to file:', writeError);
      throw writeError;
    }

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeAITools().catch(console.error);
