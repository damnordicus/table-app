import { useLoaderData, useFetcher } from 'react-router';
import { useState } from 'react';
import type { LoaderFunction, ActionFunction } from 'react-router';
import { FilamentBrandScraper, type FilamentBrand } from '~/utils/filamentScraper.server';

// Cache the results in memory (will reset when server restarts)
let cachedBrands: FilamentBrand[] = [];
let lastScraped: string | null = null;

export const loader = async () => {
  return { 
    brands: cachedBrands,
    lastScraped
  };
};

export const action = async () => {
  const scraper = new FilamentBrandScraper();
  
  try {
    console.log("Starting scraper...");
    const brands = await scraper.runScraper();
    console.log(`Scraping complete. Found ${brands.length} brands.`);
    
    // Update the cache
    cachedBrands = brands;
    lastScraped = new Date().toISOString();
    
    return { 
      success: true, 
      message: `Successfully scraped ${brands.length} filament brands.`,
      brands,
      lastScraped
    };
  } catch (error) {
    console.error('Failed to run filament brand scraper:', error);
    return { 
      success: false, 
      message: 'Failed to scrape filament brands. See server logs for details.',
      status: 500
    };
  }
};

export default function FilamentBrandsPage() {
  const { brands, lastScraped } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<FilamentBrand | null>(null);

  const fetcher = useFetcher();
  const isLoading = fetcher.state === 'submitting';
  
  // Filter brands based on search term
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Filament Brands Directory</h1>
      
      <div className="mb-6">
        <fetcher.Form method="post" className="flex mb-4">
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Scraping...' : 'Run Scraper Now'}
          </button>
        </fetcher.Form>
        
        {lastScraped && (
          <p className="text-sm text-gray-600">
            Last scraped: {new Date(lastScraped).toLocaleString()}
          </p>
        )}
        
        {fetcher.data?.message && (
          <div className={`mt-2 p-2 rounded ${
            fetcher.data.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {fetcher.data.message}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-6 gap-6">
        <div className="md:col-span-2">
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Brands
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Type to filter brands..."
            />
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand, index) => (
                  <li 
                    key={index} 
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      selectedBrand?.name === brand.name ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    <div className="font-medium text-black">{brand.name}</div>
                    <div className="text-sm text-gray-500">Source: {brand.source}</div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-500">
                  {brands.length === 0 ? 'Run the scraper to fetch brands' : 'No brands match your search'}
                </li>
              )}
            </ul>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            Total brands: {brands.length}
          </p>
        </div>
        
        <div className="md:col-span-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedBrand ? selectedBrand.name : 'Select a brand to view details'}
            </h2>
            
            {selectedBrand ? (
              <div>
                <div className="mb-4">
                  <span className="font-medium">Source:</span> {selectedBrand.name}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Use in Your Application</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="mb-2">Example code to reference this brand:</p>
                    <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                      {`// Reference the brand in your app
const brandName = "${selectedBrand.name}";

// Example validation function
function validateBrandName(input) {
  return input.toLowerCase() === "${selectedBrand.name.toLowerCase()}";
}`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Select a brand from the list to view more information.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}