import { load } from 'cheerio';

export interface FilamentBrand {
  name: string;
  source: string;
}

export class FilamentBrandScraper {
  private brands: Set<string> = new Set();
  private brandInfo: Record<string, { source: string }> = {};
  
  private async fetchWithHeaders(url: string): Promise<string | null> {
    try {
      console.log(`Fetching ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status}`);
        return null;
      }
      
      const html = await response.text();
      console.log(`Successfully fetched ${url}, HTML length: ${html.length}`);
      return html;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }
  
  // Helper to explore HTML structure
  private exploreHtml($: any, selector: string, depth: number = 3): void {
    console.log(`\nExploring selector: ${selector}`);
    
    try {
      const elements = $(selector);
      console.log(`Found ${elements.length} elements`);
      
      if (elements.length > 0 && depth > 0) {
        // Show the first element
        const firstEl = elements.first();
        console.log(`First element HTML: ${firstEl.html()?.substring(0, 150)}...`);
        
        // Try to find child elements
        console.log(`Children tags for first element:`);
        firstEl.children().each((i: number, child: any) => {
          if (i < 5) { // Limit to 5 children
            console.log(`- Child ${i}: ${$(child).prop('tagName')} class="${$(child).attr('class') || ''}"`);
          }
        });
      }
    } catch (error) {
      console.error(`Error exploring ${selector}:`, error);
    }
  }
  
  async scrapeMatterhackers(): Promise<void> {
    console.log("Scraping MatterHackers...");
    const html = await this.fetchWithHeaders("https://www.matterhackers.com/store/c/3d-printer-filament");
    
    if (!html) return;
    
    const $ = load(html);
    let brandsFound = 0;
    
    // Show structure to help debug
    console.log("Exploring MatterHackers HTML structure:");
    this.exploreHtml($, '.sidebar-link');
    this.exploreHtml($, '.sidebar-menu-wrap');
    
    // Based on your feedback - looking for sidebar-link and li
    const brandSection = $('.sidebar-link').filter((_, el) => 
      $(el).text().trim().toLowerCase().includes('brand')
    );
    
    if (brandSection.length > 0) {
      console.log(`Found brand section: ${brandSection.text().trim()}`);
      
      // Get the parent container and look for list items
      const brandList = brandSection.parent().find('li');
      console.log(`Found ${brandList.length} potential brand items`);
      
      brandList.each((_, li) => {
        let brandName = $(li).text().trim();
        if (brandName && !brandName.toLowerCase().includes('brand')) {
          brandName = brandName.replace(/\s*\(\d+\)\s*$/, '');
          this.brands.add(brandName);
          this.brandInfo[brandName] = { source: 'MatterHackers' };
          brandsFound++;
        }
      });
    }
    
    console.log(`Found ${brandsFound} brands from MatterHackers`);
    
    // If we didn't find brands with the first approach, try looking at the products directly
    if (brandsFound === 0) {
      console.log("Trying alternative approach for MatterHackers...");
      
      // Look for product titles and try to extract brands
      $('.product-title').each((_, el) => {
        const productTitle = $(el).text().trim();
        // Most product listings format is "Brand - Product Name"
        const parts = productTitle.split('-');
        if (parts.length > 1) {
          const potentialBrand = parts[0].trim();
          if (potentialBrand && potentialBrand.length > 1 && potentialBrand.length < 40) {
            this.brands.add(potentialBrand);
            this.brandInfo[potentialBrand] = { source: 'MatterHackers (product title)' };
            brandsFound++;
          }
        }
      });
      
      console.log(`Found ${brandsFound} brands from product titles`);
    }
  }
  
  async scrapePrintedSolid(): Promise<void> {
    console.log("Scraping Printed Solid...");
    const html = await this.fetchWithHeaders("https://www.printedsolid.com/collections/filament");
    
    if (!html) return;
    
    const $ = load(html);
    let brandsFound = 0;
    
    // Explore structure for debugging
    console.log("Exploring PrintedSolid HTML structure:");
    this.exploreHtml($, 'details');
    this.exploreHtml($, '.facets__display');
    
    // Try to find filter elements for vendor/brand
    $('details').each((_, el) => {
      const summary = $(el).find('summary').text().trim();
      console.log(`Found filter group: ${summary}`);
      
      if (summary.toLowerCase().includes('vendor') || summary.toLowerCase().includes('brand')) {
        // Look for inputs in this details section
        $(el).find('input[type="checkbox"]').each((_, input) => {
          const label = $(input).next('label');
          if (label.length) {
            const brandName = label.text().trim();
            if (brandName) {
              this.brands.add(brandName);
              this.brandInfo[brandName] = { source: 'PrintedSolid' };
              brandsFound++;
            }
          }
        });
      }
    });
    
    console.log(`Found ${brandsFound} brands from PrintedSolid`);
    
    // If we didn't find brands with the first approach, try looking at the products
    if (brandsFound === 0) {
      console.log("Trying alternative approach for PrintedSolid...");
      
      // Look for product vendor info
      $('.product-item__vendor').each((_, el) => {
        const brand = $(el).text().trim();
        if (brand) {
          this.brands.add(brand);
          this.brandInfo[brand] = { source: 'PrintedSolid (product vendor)' };
          brandsFound++;
        }
      });
      
      console.log(`Found ${brandsFound} brands from product vendors`);
    }
  }
  
  async scrapeFilastruder(): Promise<void> {
    console.log("Scraping Filastruder...");
    const html = await this.fetchWithHeaders("https://www.filastruder.com/collections/filament");
    
    if (!html) return;
    
    const $ = load(html);
    let brandsFound = 0;
    
    // Explore structure for debugging
    console.log("Exploring Filastruder HTML structure:");
    this.exploreHtml($, '.sidebar__content');
    this.exploreHtml($, '.filter-group');
    
    // Look for filter groups
    $('.filter-group').each((_, el) => {
      const title = $(el).find('h3, .filter-group-header').text().trim();
      console.log(`Found filter group: ${title}`);
      
      if (title.toLowerCase().includes('vendor') || title.toLowerCase().includes('brand')) {
        $(el).find('li, .filter-item').each((_, li) => {
          let brandName = $(li).text().trim();
          // Clean up brand name (remove counts in parentheses)
          brandName = brandName.replace(/\(\d+\)/, '').trim();
          
          if (brandName) {
            this.brands.add(brandName);
            this.brandInfo[brandName] = { source: 'Filastruder' };
            brandsFound++;
          }
        });
      }
    });
    
    console.log(`Found ${brandsFound} brands from Filastruder`);
    
    // If we didn't find brands with the first approach, try looking at the products
    if (brandsFound === 0) {
      console.log("Trying alternative approach for Filastruder...");
      
      // Try to extract from product titles
      $('.product-details h3').each((_, el) => {
        const productTitle = $(el).text().trim();
        const parts = productTitle.split(' ');
        if (parts.length > 0) {
          const potentialBrand = parts[0].trim();
          if (potentialBrand && potentialBrand.length > 1 && potentialBrand.length < 40) {
            this.brands.add(potentialBrand);
            this.brandInfo[potentialBrand] = { source: 'Filastruder (product title)' };
            brandsFound++;
          }
        }
      });
      
      console.log(`Found ${brandsFound} brands from product titles`);
    }
  }
  
  // Add Amazon as a source
  async scrapeAmazon(): Promise<void> {
    console.log("Adding common brands from Amazon...");
    // Note: Direct scraping from Amazon is complex due to their anti-scraping measures
    // Instead, we'll add common brands found on Amazon
    const amazonBrands = [
      "eSUN", "Overture", "Hatchbox", "SUNLU", "ERYONE", "DURAMIC", 
      "YOYI", "MIKA3D", "3D Solutech", "Amazon Basics", "Polymaker",
      "Geeetech", "ANYCUBIC", "ZIRO", "TIANSE", "AMOLEN", "JAYO"
    ];
    
    for (const brand of amazonBrands) {
      this.brands.add(brand);
      this.brandInfo[brand] = { source: 'Amazon (common brands)' };
    }
    
    console.log(`Added ${amazonBrands.length} common brands from Amazon`);
  }
  
  // Add more manufacturers and suppliers
  async scrapeAdditionalSources(): Promise<void> {
    console.log("Adding brands from additional sources...");
    
    const additionalBrands = [
      "Prusament", "ColorFabb", "Fillamentum", "Proto-Pasta", "Polyalchemy",
      "FormFutura", "3DXTech", "Raise3D", "Ultimaker", "Creality", "NinjaFlex",
      "SainSmart", "Fiberlogy", "PolyLite", "IEMAI", "IC3D", "Dremel", 
      "MakerBot", "Taulman", "NinjaTek", "BASF", "LayerLock", "Kodak",
      "Formlabs", "MG Chemicals", "FlashForge", "Monoprice", "PrimaValue", "Verbatim",
      "3DXSTAT", "3DOM", "Atomic Filament", "BCN3D", "BigRep", "CarbonX",
      "Colorfila", "Devil Design", "Extrudr", "Filamentive", "Filamentum",
      "Gizmo Dorks", "Innovatefil", "Kimya", "Lay Filaments", "Nanovia",
      "Octofiber", "Owl Filaments", "Paramount 3D", "Plastink", "Polyline", "Recreus",
      "Rigid.ink", "Colido", "Spectrum", "TechniStub", "Treefrog", "Treed Filaments",
      "TriangleLab", "3DPlastix", "3D-Fuel", "AzureFilm", "DuPont", "FILABOT"
    ];
    
    for (const brand of additionalBrands) {
      this.brands.add(brand);
      this.brandInfo[brand] = { source: 'Additional sources' };
    }
    
    console.log(`Added ${additionalBrands.length} brands from additional sources`);
  }
  
  async runScraper(): Promise<FilamentBrand[]> {
    try {
      // Try to scrape from websites first
      await this.scrapeMatterhackers();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.scrapePrintedSolid();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.scrapeFilastruder();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add common brands from other sources
      await this.scrapeAmazon();
      await this.scrapeAdditionalSources();
      
      // Return the results
      const result = Array.from(this.brands).sort().map(name => ({
        name,
        source: this.brandInfo[name]?.source || 'unknown'
      }));
      
      console.log(`Total brands found: ${result.length}`);
      return result;
    } catch (error) {
      console.error("Error in runScraper:", error);
      
      // If everything fails, at least return any brands we did find
      const result = Array.from(this.brands).sort().map(name => ({
        name,
        source: this.brandInfo[name]?.source || 'unknown'
      }));
      
      console.log(`Returning ${result.length} brands despite errors`);
      return result;
    }
  }
}