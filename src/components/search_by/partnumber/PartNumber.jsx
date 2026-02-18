import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  partRelationsAPI,
  partsListAPI,
  vehicleListAPI,
  stockListAPI,
  partsmartTextSearchAPI,
} from "../../../services/api";
import {
  fetchVehicleListByPartNumber,
} from "../../../services/apiservice";
import { getAssets } from "../../../utils/assets";
import Search from "../../home/Search";
import VehicleContextModal from "../../home/VehicleContextModal";
import { useCart } from "../../../context/CartContext";
import NoImage from "../../../assets/No Image.png";
import Product2 from "./Product2";
import "../../../styles/search_by/partnumber/PartNumber.css";
import "../../../styles/skeleton/skeleton.css";

/* ---------------- COMPATIBILITY MODAL ---------------- */
const CompatibilityModal = ({ onClose, partNumber, onVehicleSelect, vehicles: initialVehicles = [] }) => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [filteredVehicles, setFilteredVehicles] = useState(initialVehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 50;

  // Fetch vehicles with pagination (fallback if no initial vehicles provided)
  useEffect(() => {
    const fetchVehicles = async () => {
      // If we already have vehicles from props, don't fetch
      if (initialVehicles && initialVehicles.length > 0) {
        setVehicles(initialVehicles);
        setFilteredVehicles(initialVehicles);
        setLoading(false);
        return;
      }

      if (!partNumber) return;
      setLoading(true);
      try {
        const response = await fetchVehicleListByPartNumber(partNumber, ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE);
        const newVehicles = response.data || [];
        
        if (page === 1) {
          setVehicles(newVehicles);
          setFilteredVehicles(newVehicles);
        } else {
          setVehicles(prev => [...prev, ...newVehicles]);
          setFilteredVehicles(prev => [...prev, ...newVehicles]);
        }
        
        setHasMore(newVehicles.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [partNumber, page, initialVehicles]);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVehicles(vehicles);
      return;
    }
    
    const filtered = vehicles.filter((v) =>
      Object.values(v).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // Handle scroll for infinite loading
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Handle vehicle row click
  const handleVehicleClick = (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    onClose();
  };

  return (
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        <div className="pn-modal-header">
          <div className="pn-modal-title">
            Compatible Vehicles ({vehicles.length})
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pn-modal-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="pn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="pn-table-container">
          <div className="pn-modal-table-header">
            <span>Make</span>
            <span>Model</span>
            <span>Variant</span>
            <span>Fuel Type</span>
            <span>Year</span>
          </div>
        </div>

        <div className="pn-modal-table-body" onScroll={handleScroll}>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((v, i) => (
              <div 
                key={i} 
                className="pn-modal-row"
                onClick={() => handleVehicleClick(v)}
                style={{ cursor: 'pointer' }}
              >
                <span>{v.vehicleMake || v.make}</span>
                <span>{v.vehicleModel || v.model}</span>
                <span>{v.vehicleVariant || v.variant}</span>
                <span>{v.vehicleFuelType || v.fuelType}</span>
                <span>{v.vehicleFromYear || v.year}</span>
              </div>
            ))
          ) : (
            <div className="pn-no-results" style={{ padding: "20px", textAlign: "center" }}>
              {loading ? "Loading..." : "No vehicles found"}
            </div>
          )}
          {loading && hasMore && (
            <div style={{ padding: "10px", textAlign: "center" }}>Loading more...</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
const PartNumber = () => {
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState({});
  const rawSearchKey = state?.partNumber || "";
  
  // Extract vehicle context from navigation state OR URL parameters
  const urlMake = searchParams.get('make');
  const urlModel = searchParams.get('model');
  const urlVariant = searchParams.get('variant');
  const urlFuelType = searchParams.get('fuelType');
  const urlYear = searchParams.get('year');
  const urlQuery = searchParams.get('q');
  
  const initialVehicle = state?.vehicle || {
    make: urlMake || "",
    model: urlModel || "",
    variant: urlVariant || "",
    fuelType: urlFuelType || "",
    year: urlYear || ""
  };
  const originalSearchQuery = state?.searchQuery || urlQuery || rawSearchKey;
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  // Use originalSearchQuery which includes URL parameter 'q' for page loads
  const searchKey = originalSearchQuery || rawSearchKey;
  const { addToCart } = useCart();
  
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState("");
  const [selectedPartVehicles, setSelectedPartVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [otherBrandProducts, setOtherBrandProducts] = useState([]);
  const [alignedProducts, setAlignedProducts] = useState([]);
  const [totalPartsCount, setTotalPartsCount] = useState(0);
  const [openFilter, setOpenFilter] = useState(null);
  const [batchLoadingProgress, setBatchLoadingProgress] = useState(null);

  // Vehicle filter states - Initialize with vehicle from navigation state
  const [selectedMake, setSelectedMake] = useState(initialVehicle.make || "");
  const [selectedModel, setSelectedModel] = useState(initialVehicle.model || "");
  const [selectedVariant, setSelectedVariant] = useState(initialVehicle.variant || "");
  const [selectedFuel, setSelectedFuel] = useState(initialVehicle.fuelType || "");
  const [selectedYear, setSelectedYear] = useState(initialVehicle.year ? initialVehicle.year.toString() : "");

  // Right filters state
  const [rightFilters, setRightFilters] = useState({
    year: "",
    fuelType: "",
    eta: "",
  });
  
  // Vehicle context modal state
  const [vehicleModal, setVehicleModal] = useState({
    isOpen: false,
    searchQuery: "",
    missingFields: [],
    extractedFields: {},
  });

  // Function to update URL with vehicle context and search query
  const updateURLParams = (vehicleData = {}, query = null) => {
    const params = new URLSearchParams();
    
    const make = vehicleData.make || selectedMake;
    const model = vehicleData.model || selectedModel;
    const variant = vehicleData.variant || selectedVariant;
    const fuelType = vehicleData.fuelType || selectedFuel;
    const year = vehicleData.year || selectedYear;
    const searchQuery = query || originalSearchQuery || searchKey;
    
    if (searchQuery) params.set('q', searchQuery);
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (variant) params.set('variant', variant);
    if (fuelType) params.set('fuelType', fuelType);
    if (year) params.set('year', year);
    
    setSearchParams(params, { replace: true });
  };

  // Extract vehicle options from products
  const [vehicleOptions, setVehicleOptions] = useState({
    makes: [],
    models: [],
    variants: [],
    fuelTypes: [],
    years: [],
  });

  // Handler for opening compatibility modal
  const handleCompatibilityClick = (product) => {
    setSelectedPartNumber(product.partNumber);
    setSelectedPartVehicles(product.vehicles || []);
    setShowCompatibility(true);
  };
  
  // Handler for vehicle modal completion
  const handleVehicleModalComplete = async (results, vehicleContextFromModal) => {
    console.log("✅ Vehicle modal search complete:", results);
    console.log("🚗 Vehicle context from modal:", vehicleContextFromModal);
    
    // Close the modal
    setVehicleModal(prev => ({ ...prev, isOpen: false }));
    
    // Update URL with complete vehicle context - this will trigger a re-fetch via useEffect
    updateURLParams(vehicleContextFromModal, vehicleModal.searchQuery);
    
    // Update filter states with complete vehicle context
    if (vehicleContextFromModal.make) setSelectedMake(vehicleContextFromModal.make);
    if (vehicleContextFromModal.model) setSelectedModel(vehicleContextFromModal.model);
    if (vehicleContextFromModal.variant) setSelectedVariant(vehicleContextFromModal.variant);
    if (vehicleContextFromModal.fuelType) setSelectedFuel(vehicleContextFromModal.fuelType);
    if (vehicleContextFromModal.year) setSelectedYear(vehicleContextFromModal.year.toString());
    
    // Fetch dropdown options from lookup API to populate the dropdowns
    try {
      const apiService = (await import("../../../services/apiservice")).default;
      
      // Fetch makes
      const makesResponse = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        limit: 50
      });
      
      const makes = makesResponse?.data?.data?.makes || [];
      
      // Fetch models if make is available
      let models = [];
      if (vehicleContextFromModal.make) {
        const modelsResponse = await apiService.post('/partsmart/search', {
          search_type: "lookup",
          lookup_type: "vehicle",
          vehicle: { make: vehicleContextFromModal.make },
          limit: 50
        });
        models = modelsResponse?.data?.data?.models || [];
      }
      
      // Fetch variants, fuel types, and years if model is available
      let variants = [];
      let fuelTypes = [];
      let years = [];
      if (vehicleContextFromModal.make && vehicleContextFromModal.model) {
        const detailsResponse = await apiService.post('/partsmart/search', {
          search_type: "lookup",
          lookup_type: "vehicle",
          vehicle: { 
            make: vehicleContextFromModal.make, 
            model: vehicleContextFromModal.model 
          },
          limit: 50
        });
        const apiData = detailsResponse?.data?.data || detailsResponse?.data;
        variants = apiData?.variants || [];
        fuelTypes = apiData?.fuel_types || [];
        years = apiData?.years?.map(y => y.toString()) || [];
      }
      
      // Update vehicle options state
      setVehicleOptions({
        makes,
        models,
        variants,
        fuelTypes,
        years
      });
    } catch (error) {
      console.error("❌ Error fetching dropdown options:", error);
    }
    
    // The results are already available from the modal, so we can process them directly
    // Transform the results to match the expected format
    if (results?.data?.tvs) {
      setLoading(true);
      
      try {
        let allProducts = [];
        const productVehicleMap = {};
        
        Object.entries(results.data.tvs).forEach(([partKey, parts]) => {
          if (Array.isArray(parts)) {
            const vehiclesForPart = [];
            const uniqueVehicles = new Set();
            
            parts.forEach((part) => {
              const vehicleKey = `${part.vehicleMake}_${part.vehicleModel}_${part.vehicleVariant}_${part.vehicleFuelType}_${part.vehicleFromYear}`;
              if (!uniqueVehicles.has(vehicleKey)) {
                uniqueVehicles.add(vehicleKey);
                vehiclesForPart.push({
                  vehicleMake: part.vehicleMake,
                  vehicleModel: part.vehicleModel,
                  vehicleVariant: part.vehicleVariant,
                  vehicleFuelType: part.vehicleFuelType,
                  vehicleFromYear: part.vehicleFromYear,
                  vehicleToYear: part.vehicleToYear,
                });
              }
            });

            parts.forEach((part) => {
              const partNum = part.partNumber || part.part_number;
              
              if (!productVehicleMap[partNum]) {
                productVehicleMap[partNum] = vehiclesForPart;
              }
              
              allProducts.push({
                id: part.id || partNum,
                partNumber: partNum,
                brandName: part.brandName || part.brand,
                name: part.name || part.title || part.description,
                itemDescription: part.description || part.partDescription,
                listPrice: part.listPrice || part.list_price,
                mrp: part.mrp,
                imageUrl: part.image_url || NoImage,
                vehicleMake: part.vehicleMake || part.vehicle_make,
                vehicleModel: part.vehicleModel || part.vehicle_model,
                vehicleVariant: part.vehicleVariant || part.vehicle_variant,
                vehicleFuelType: part.vehicleFuelType || part.vehicle_fuel_type || part.fuelType,
                vehicleFromYear: part.vehicleFromYear || part.vehicle_from_year || part.year,
                vehicleToYear: part.vehicleToYear || part.vehicle_to_year,
                aggregate: part.aggregate || part.category,
                subAggregate: part.subAggregate || part.subcategory,
                compatibleVehicles: uniqueVehicles.size,
                vehicles: vehiclesForPart,
              });
            });
          }
        });

        const totalCount = allProducts.length;
        setTotalPartsCount(totalCount);

        // Fetch stock status for all products
        allProducts = await fetchStockStatus(allProducts);

        // Separate myTVS and other brands
        const myTvsProducts = allProducts.filter(p => 
          p.brandName?.toUpperCase() === "MYTVS"
        );
        const otherProducts = allProducts.filter(p => 
          p.brandName?.toUpperCase() !== "MYTVS"
        );

        setRecommendedProducts(myTvsProducts);
        setOtherBrandProducts(otherProducts);
        setError(null);
      } catch (error) {
        console.error("❌ Error processing vehicle modal results:", error);
        setError("Failed to process search results.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
      } finally {
        setLoading(false);
      }
    } else {
      setError("No products found for this search.");
      setRecommendedProducts([]);
      setOtherBrandProducts([]);
      setAlignedProducts([]);
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openFilter) setOpenFilter(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openFilter]);

  // Fetch dropdown options from lookup API when URL parameters are present
  useEffect(() => {
    const fetchInitialDropdownOptions = async () => {
      // If we have URL parameters, fetch dropdown options from lookup API
      if (urlMake || urlModel || urlVariant) {
        console.log("🔍 Fetching dropdown options from lookup API for URL params");
        
        try {
          // Import apiService for lookup API
          const apiService = (await import("../../../services/apiservice")).default;
          
          // Fetch makes
          const makesResponse = await apiService.post('/partsmart/search', {
            search_type: "lookup",
            lookup_type: "vehicle",
            limit: 50
          });
          
          if (makesResponse?.data?.data?.makes) {
            setVehicleOptions(prev => ({
              ...prev,
              makes: makesResponse.data.data.makes
            }));
          }
          
          // If we have a make, fetch models
          if (urlMake) {
            const modelsResponse = await apiService.post('/partsmart/search', {
              search_type: "lookup",
              lookup_type: "vehicle",
              vehicle: { make: urlMake },
              limit: 50
            });
            
            if (modelsResponse?.data?.data?.models) {
              setVehicleOptions(prev => ({
                ...prev,
                models: modelsResponse.data.data.models
              }));
            }
          }
          
          // If we have make and model, fetch variants, fuel types, and years
          if (urlMake && urlModel) {
            const detailsResponse = await apiService.post('/partsmart/search', {
              search_type: "lookup",
              lookup_type: "vehicle",
              vehicle: { make: urlMake, model: urlModel },
              limit: 50
            });
            
            const apiData = detailsResponse?.data?.data || detailsResponse?.data;
            if (apiData) {
              setVehicleOptions(prev => ({
                ...prev,
                variants: apiData.variants || [],
                fuelTypes: apiData.fuel_types || [],
                years: apiData.years?.map(y => y.toString()) || []
              }));
            }
          }
          
          console.log("✅ Initial dropdown options loaded from lookup API");
        } catch (error) {
          console.error("❌ Error fetching initial dropdown options:", error);
        }
      }
    };
    
    fetchInitialDropdownOptions();
  }, [urlMake, urlModel, urlVariant]);

  // Fetch ALL makes from lookup API on component mount (independent of products)
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        console.log("🔍 Fetching ALL makes from lookup API");
        
        const apiService = (await import("../../../services/apiservice")).default;
        const response = await apiService.post('/partsmart/search', {
          search_type: "lookup",
          lookup_type: "vehicle",
          limit: 50
        });
        
        if (response?.data?.data?.makes) {
          setVehicleOptions(prev => ({
            ...prev,
            makes: response.data.data.makes
          }));
          console.log("✅ Makes loaded from lookup API:", response.data.data.makes.length);
        }
      } catch (error) {
        console.error("❌ Error fetching makes from lookup API:", error);
      }
    };

    fetchMakes();
  }, []); // Run once on mount, independent of products

  // Fetch models when make is selected
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedMake) {
        setVehicleOptions(prev => ({
          ...prev,
          models: [],
          variants: [],
          fuelTypes: [],
          years: [],
        }));
        return;
      }

      try {
        console.log("🔍 Fetching models for make:", selectedMake);
        
        const partNumbers = [...new Set([...recommendedProducts, ...otherBrandProducts].map(p => p.partNumber).filter(Boolean))];

        if (partNumbers.length === 0) {
          console.log("⚠️ No part numbers available for models fetch");
          return;
        }

        const response = await vehicleListAPI({
          partNumber: partNumbers.length > 0 ? partNumbers : null,
          customerCode: "0046",
          limit: 1000,
          offset: 0,
          sortOrder: "ASC",
          brand: null,
          aggregate: null,
          subAggregate: null,
          make: selectedMake,
          model: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        });

        if (response?.data && response.data.length > 0) {
          const models = new Set();
          response.data.forEach((vehicle) => {
            if (vehicle.model) models.add(vehicle.model);
          });

          setVehicleOptions(prev => ({
            ...prev,
            models: Array.from(models).sort(),
            variants: [],
            fuelTypes: [],
            years: [],
          }));
          
          console.log("✅ Models loaded:", models.size, Array.from(models));
        } else {
          console.log("⚠️ No vehicle data returned from API for models");
        }
      } catch (error) {
        console.error("❌ Error fetching models:", error);
      }
    };

    fetchModels();
  }, [selectedMake, recommendedProducts, otherBrandProducts]);

  // Fetch variants when model is selected
  useEffect(() => {
    const fetchVariants = async () => {
      if (!selectedMake || !selectedModel) {
        setVehicleOptions(prev => ({
          ...prev,
          variants: [],
          fuelTypes: [],
          years: [],
        }));
        return;
      }

      try {
        console.log("🔍 Fetching variants for model:", selectedModel);
        
        const partNumbers = [...new Set([...recommendedProducts, ...otherBrandProducts].map(p => p.partNumber).filter(Boolean))];

        if (partNumbers.length === 0) {
          console.log("⚠️ No part numbers available for variants fetch");
          return;
        }

        const response = await vehicleListAPI({
          partNumber: partNumbers.length > 0 ? partNumbers : null,
          customerCode: "0046",
          limit: 1000,
          offset: 0,
          sortOrder: "ASC",
          brand: null,
          aggregate: null,
          subAggregate: null,
          make: selectedMake,
          model: selectedModel,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        });

        if (response?.data && response.data.length > 0) {
          const variants = new Set();
          response.data.forEach((vehicle) => {
            if (vehicle.variant) variants.add(vehicle.variant);
          });

          setVehicleOptions(prev => ({
            ...prev,
            variants: Array.from(variants).sort(),
            fuelTypes: [],
            years: [],
          }));
          
          console.log("✅ Variants loaded:", variants.size, Array.from(variants));
        } else {
          console.log("⚠️ No vehicle data returned from API for variants");
        }
      } catch (error) {
        console.error("❌ Error fetching variants:", error);
      }
    };

    fetchVariants();
  }, [selectedModel, selectedMake, recommendedProducts, otherBrandProducts]);

  // Fetch fuel types when variant is selected
  useEffect(() => {
    const fetchFuelTypes = async () => {
      if (!selectedMake || !selectedModel || !selectedVariant) {
        setVehicleOptions(prev => ({
          ...prev,
          fuelTypes: [],
          years: [],
        }));
        return;
      }

      try {
        console.log("🔍 Fetching fuel types for variant:", selectedVariant);
        
        const partNumbers = [...new Set([...recommendedProducts, ...otherBrandProducts].map(p => p.partNumber).filter(Boolean))];

        if (partNumbers.length === 0) {
          console.log("⚠️ No part numbers available for fuel types fetch");
          return;
        }

        const response = await vehicleListAPI({
          partNumber: partNumbers.length > 0 ? partNumbers : null,
          customerCode: "0046",
          limit: 1000,
          offset: 0,
          sortOrder: "ASC",
          brand: null,
          aggregate: null,
          subAggregate: null,
          make: selectedMake,
          model: selectedModel,
          variant: selectedVariant,
          fuelType: null,
          vehicle: null,
          year: null,
        });

        if (response?.data && response.data.length > 0) {
          const fuelTypes = new Set();
          response.data.forEach((vehicle) => {
            if (vehicle.fuelType) fuelTypes.add(vehicle.fuelType);
          });

          setVehicleOptions(prev => ({
            ...prev,
            fuelTypes: Array.from(fuelTypes).sort(),
            years: [],
          }));
          
          console.log("✅ Fuel types loaded:", fuelTypes.size, Array.from(fuelTypes));
        } else {
          console.log("⚠️ No vehicle data returned from API for fuel types");
        }
      } catch (error) {
        console.error("❌ Error fetching fuel types:", error);
      }
    };

    fetchFuelTypes();
  }, [selectedVariant, selectedModel, selectedMake, recommendedProducts, otherBrandProducts]);

  // Fetch years when fuel type is selected
  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedMake || !selectedModel || !selectedVariant || !selectedFuel) {
        setVehicleOptions(prev => ({
          ...prev,
          years: [],
        }));
        return;
      }

      try {
        console.log("🔍 Fetching years for fuel type:", selectedFuel);
        
        const partNumbers = [...new Set([...recommendedProducts, ...otherBrandProducts].map(p => p.partNumber).filter(Boolean))];

        if (partNumbers.length === 0) {
          console.log("⚠️ No part numbers available for years fetch");
          return;
        }

        const response = await vehicleListAPI({
          partNumber: partNumbers.length > 0 ? partNumbers : null,
          customerCode: "0046",
          limit: 1000,
          offset: 0,
          sortOrder: "ASC",
          brand: null,
          aggregate: null,
          subAggregate: null,
          make: selectedMake,
          model: selectedModel,
          variant: selectedVariant,
          fuelType: selectedFuel,
          vehicle: null,
          year: null,
        });

        if (response?.data && response.data.length > 0) {
          const years = new Set();
          response.data.forEach((vehicle) => {
            // Extract year from "2013 to 2013" format
            const yearMatch = vehicle.year?.match(/^(\d{4})/);
            if (yearMatch) {
              years.add(yearMatch[1]);
            }
          });

          setVehicleOptions(prev => ({
            ...prev,
            years: Array.from(years).sort((a, b) => b - a),
          }));
          
          console.log("✅ Years loaded:", years.size, Array.from(years));
        } else {
          console.log("⚠️ No vehicle data returned from API for years");
        }
      } catch (error) {
        console.error("❌ Error fetching years:", error);
      }
    };

    fetchYears();
  }, [selectedFuel, selectedVariant, selectedModel, selectedMake, recommendedProducts, otherBrandProducts]);

  // Fetch stock status for products
  const fetchStockStatus = async (products) => {
    try {
      const partNumbers = products.map(p => p.partNumber).filter(Boolean);
      if (partNumbers.length === 0) return products;

      const stockResponse = await stockListAPI({ 
        partNumbers,
        customerCode: "0046"
      });
      const stockMap = {};
      
      if (stockResponse?.data) {
        // Group by partNumber and calculate total quantity
        stockResponse.data.forEach(item => {
          const partNum = item.partNumber;
          if (!stockMap[partNum]) {
            stockMap[partNum] = { totalQty: 0, items: [] };
          }
          stockMap[partNum].totalQty += (item.qty || 0);
          stockMap[partNum].items.push(item);
        });
      }

      return products.map(product => {
        const stockInfo = stockMap[product.partNumber];
        let stockStatus = "Out of Stock";
        
        if (stockInfo && stockInfo.totalQty > 0) {
          stockStatus = "In Stock";
        }
        
        return {
          ...product,
          stockStatus,
          stockQuantity: stockInfo?.totalQty || 0,
        };
      });
    } catch (error) {
      console.error("Error fetching stock:", error);
      return products;
    }
  };

  // Fetch vehicle count for products
  const fetchVehicleCount = async (products) => {
    try {
      const BATCH_SIZE = 50;
      const batches = [];
      
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        batches.push(products.slice(i, i + BATCH_SIZE));
      }

      const updatedProducts = [...products];
      
      for (const batch of batches) {
        const partNumbers = batch.map(p => p.partNumber).filter(Boolean);
        if (partNumbers.length === 0) continue;

        try {
          const vehicleResponse = await vehicleListAPI({ 
            partNumber: partNumbers.length > 0 ? partNumbers : null,
            customerCode: "0046",
            limit: 10,
            offset: 0,
            sortOrder: "ASC",
            brand: null,
            aggregate: null,
            subAggregate: null,
            make: null,
            model: null,
            variant: null,
            fuelType: null,
            vehicle: null,
            year: null,
          });
          const vehicleCountMap = {};
          
          if (vehicleResponse?.data) {
            vehicleResponse.data.forEach(item => {
              vehicleCountMap[item.partNumber] = item.vehicleCount || 0;
            });
          }

          batch.forEach(product => {
            const index = updatedProducts.findIndex(p => p.partNumber === product.partNumber);
            if (index !== -1) {
              updatedProducts[index].compatibleVehicles = vehicleCountMap[product.partNumber] || 0;
            }
          });
        } catch (error) {
          console.error("Error fetching vehicle count for batch:", error);
        }
      }

      return updatedProducts;
    } catch (error) {
      console.error("Error in fetchVehicleCount:", error);
      return products;
    }
  };

  // Fetch products using Unified Search API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchKey) {
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        setAlignedProducts([]);
        return;
      }

      setLoading(true);
      setError(null);
      setBatchLoadingProgress(null);

      try {
        // Build complete search query with year if available and not already in query
        let finalSearchQuery = searchKey;
        
        // Add year if available and not in query
        if (initialVehicle.year && !finalSearchQuery.includes(initialVehicle.year.toString())) {
          finalSearchQuery = `${finalSearchQuery} ${initialVehicle.year}`;
          console.log("📝 Added year to search query:", finalSearchQuery);
        }
        
        console.log("🔍 Fetching products using Unified Search API for:", finalSearchQuery);
        console.log("🚗 Initial vehicle context:", initialVehicle);
        
        // Build vehicle context if available from navigation state
        const vehicleContext = {};
        if (initialVehicle.make) vehicleContext.make = initialVehicle.make;
        if (initialVehicle.model) vehicleContext.model = initialVehicle.model;
        
        // Send variant as-is - let API validation handle it
        // If API rejects it, we'll use the suggestions in the retry logic
        if (initialVehicle.variant) {
          vehicleContext.variant = initialVehicle.variant;
        }
        
        if (initialVehicle.fuelType) vehicleContext.fuelType = initialVehicle.fuelType;
        if (initialVehicle.year) vehicleContext.year = initialVehicle.year;
        
        // Use Unified Search API (max limit is 50)
        const requestBody = {
          query: finalSearchQuery,
          sources: ["tvs"],
          limitPerPart: 50
        };
        
        // Add vehicle context if we have at least make and model
        // API will validate and provide suggestions if variant format is wrong
        if (vehicleContext.make && vehicleContext.model) {
          requestBody.vehicle = vehicleContext;
          console.log("📡 Searching with vehicle context:", vehicleContext);
        } else {
          console.log("⚠️ Incomplete vehicle context, letting API extract from query");
          console.log("   Partial context:", vehicleContext);
        }
        
        const response = await partsmartTextSearchAPI(requestBody);

        console.log("✅ Unified Search response:", response);
        
        // Check for incomplete extraction - show modal to collect missing fields
        if (response?.summary?.status === 'incomplete_extraction') {
          console.log("⚠️ Incomplete extraction detected");
          console.log("   Extracted fields:", response.summary.extracted_fields);
          console.log("   Missing fields:", response.summary.missing_fields);
          
          setVehicleModal({
            isOpen: true,
            searchQuery: finalSearchQuery,
            missingFields: response.summary.missing_fields || [],
            extractedFields: response.summary.extracted_fields || {},
          });
          
          setLoading(false);
          return;
        }

        // Check for validation errors and retry with NLP only (no vehicle object)
        if (response?.summary?.status === 'error' && response?.error?.code === 'VALIDATION_ERROR') {
          console.warn("⚠️ API validation error:", response.error.message);
          console.log("🔄 Retrying search with NLP only (no vehicle object)");
          
          // Build a natural language query with all vehicle info
          const vehicleContext = requestBody.vehicle || {};
          const nlpQuery = `${finalSearchQuery} ${vehicleContext.make || ''} ${vehicleContext.model || ''} ${vehicleContext.variant || ''} ${vehicleContext.fuelType || ''} ${vehicleContext.year || ''}`.trim();
          
          console.log("📝 NLP Query:", nlpQuery);
          
          // Retry search with just the query - let NLP extract vehicle info
          const retryResponse = await partsmartTextSearchAPI({
            query: nlpQuery,
            sources: ['tvs'],
            limitPerPart: 10
          });
          
          console.log("✅ Retry search result (NLP only):", retryResponse);
          
          if (retryResponse?.data?.tvs) {
            console.log("✅ Retry successful with NLP only");
            processSearchResponse(retryResponse, finalSearchQuery);
            return;
          }
        }

        if (!response?.data?.tvs) {
          setError("No products found for this search.");
          setRecommendedProducts([]);
          setOtherBrandProducts([]);
          setAlignedProducts([]);
          setLoading(false);
          return;
        }

        // Process successful response
        processSearchResponse(response, finalSearchQuery);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        setAlignedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to process search response
    const processSearchResponse = async (response, searchQuery = null) => {
      // Transform Unified Search API response to product format
      let allProducts = [];
      const productVehicleMap = {}; // Store vehicles for each part number
      
      Object.entries(response.data.tvs).forEach(([partKey, parts]) => {
        if (Array.isArray(parts)) {
          // Collect all unique vehicles for this part
          const vehiclesForPart = [];
          const uniqueVehicles = new Set();
          
          parts.forEach((part) => {
            const vehicleKey = `${part.vehicleMake}_${part.vehicleModel}_${part.vehicleVariant}_${part.vehicleFuelType}_${part.vehicleFromYear}`;
            if (!uniqueVehicles.has(vehicleKey)) {
              uniqueVehicles.add(vehicleKey);
              vehiclesForPart.push({
                vehicleMake: part.vehicleMake,
                vehicleModel: part.vehicleModel,
                vehicleVariant: part.vehicleVariant,
                vehicleFuelType: part.vehicleFuelType,
                vehicleFromYear: part.vehicleFromYear,
                vehicleToYear: part.vehicleToYear,
              });
            }
          });

          parts.forEach((part) => {
            const partNum = part.partNumber || part.part_number;
            
            // Store vehicles for this part number
            if (!productVehicleMap[partNum]) {
              productVehicleMap[partNum] = vehiclesForPart;
            }
            
            allProducts.push({
              id: part.id || partNum,
              partNumber: partNum,
              brandName: part.brandName || part.brand,
              name: part.name || part.title || part.description,
              itemDescription: part.description || part.partDescription,
              listPrice: part.listPrice || part.list_price,
              mrp: part.mrp,
              imageUrl: part.image_url || NoImage,
              vehicleMake: part.vehicleMake || part.vehicle_make,
              vehicleModel: part.vehicleModel || part.vehicle_model,
              vehicleVariant: part.vehicleVariant || part.vehicle_variant,
              vehicleFuelType: part.vehicleFuelType || part.vehicle_fuel_type || part.fuelType,
              vehicleFromYear: part.vehicleFromYear || part.vehicle_from_year || part.year,
              vehicleToYear: part.vehicleToYear || part.vehicle_to_year,
              aggregate: part.aggregate || part.category,
              subAggregate: part.subAggregate || part.subcategory,
              compatibleVehicles: uniqueVehicles.size,
              vehicles: vehiclesForPart, // Store vehicles with the product
            });
          });
        }
      });

      const totalCount = allProducts.length;
      setTotalPartsCount(totalCount);

      // Fetch stock status for all products
      allProducts = await fetchStockStatus(allProducts);

      // Separate myTVS and other brands
      const myTvsProducts = allProducts.filter(p => 
        p.brandName?.toUpperCase() === "MYTVS"
      );
      const otherProducts = allProducts.filter(p => 
        p.brandName?.toUpperCase() !== "MYTVS"
      );

      setRecommendedProducts(myTvsProducts);
      setOtherBrandProducts(otherProducts);

      // Update URL with vehicle context after successful search
      updateURLParams(initialVehicle, searchQuery || originalSearchQuery);

      // FETCH ALIGNED PRODUCTS (COMMENTED OUT - NOT NEEDED)
      // await fetchAlignedProducts(searchKey);
    };

    fetchProducts();
  }, [searchKey]);

  // Fetch aligned products using partRelationsAPI
  const fetchAlignedProducts = async (partNumber) => {
    try {
      console.log("🔍 Fetching aligned products for:", partNumber);
      
      const response = await partRelationsAPI({ 
        partNumber,
        customerCode: "0046",
        type: "aligned" // or "related" - check what the API expects
      });
      
      if (!response?.data || response.data.length === 0) {
        console.log("No aligned products found");
        setAlignedProducts([]);
        return;
      }

      let alignedParts = response.data;
      
      // Fetch stock status for aligned products (no vehicle count needed)
      alignedParts = await fetchStockStatus(alignedParts);
      
      // Add default compatible vehicles count if not present
      alignedParts = alignedParts.map(part => ({
        ...part,
        compatibleVehicles: part.compatibleVehicles || 0
      }));
      
      setAlignedProducts(alignedParts);
      console.log("✅ Aligned products loaded:", alignedParts.length);
      
    } catch (error) {
      console.error("❌ Error fetching aligned products:", error);
      setAlignedProducts([]);
    }
  };

  // Apply compatibility filter
  const applyCompatibilityFilter = async () => {
    if (!selectedMake && !selectedModel && !selectedVariant && !selectedFuel && !selectedYear) {
      console.log("❌ No filters selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Applying filter:", {
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant,
        fuel: selectedFuel,
        year: selectedYear,
      });

      // Build vehicle context for Unified Search API
      const vehicleContext = {};
      if (selectedMake) vehicleContext.make = selectedMake;
      if (selectedModel) vehicleContext.model = selectedModel;
      if (selectedVariant) vehicleContext.variant = selectedVariant;
      if (selectedFuel) vehicleContext.fuelType = selectedFuel;
      if (selectedYear) vehicleContext.year = parseInt(selectedYear);

      // Use Unified Search API with vehicle context (max limit is 50)
      const response = await partsmartTextSearchAPI({
        search_type: "text",
        query: searchKey,
        vehicle: vehicleContext,
        sources: ["tvs"],
        limit: 50
      });

      if (!response?.data?.tvs) {
        setError("No products found matching the selected filters.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        setLoading(false);
        return;
      }

      // Transform response
      let filteredProducts = [];
      Object.entries(response.data.tvs).forEach(([partKey, parts]) => {
        if (Array.isArray(parts)) {
          // Count unique vehicles for this part group
          const uniqueVehicles = new Set();
          parts.forEach((part) => {
            const vehicleKey = `${part.vehicleMake}_${part.vehicleModel}_${part.vehicleVariant}_${part.vehicleFuelType}_${part.vehicleFromYear}`;
            uniqueVehicles.add(vehicleKey);
          });

          parts.forEach((part) => {
            filteredProducts.push({
              id: part.id || part.partNumber,
              partNumber: part.partNumber || part.part_number,
              brandName: part.brandName || part.brand,
              name: part.name || part.title || part.description,
              itemDescription: part.description || part.partDescription,
              listPrice: part.listPrice || part.list_price,
              mrp: part.mrp,
              imageUrl: part.image_url || NoImage,
              vehicleMake: part.vehicleMake || part.vehicle_make,
              vehicleModel: part.vehicleModel || part.vehicle_model,
              vehicleVariant: part.vehicleVariant || part.vehicle_variant,
              vehicleFuelType: part.vehicleFuelType || part.vehicle_fuel_type || part.fuelType,
              vehicleFromYear: part.vehicleFromYear || part.vehicle_from_year || part.year,
              vehicleToYear: part.vehicleToYear || part.vehicle_to_year,
              aggregate: part.aggregate || part.category,
              subAggregate: part.subAggregate || part.subcategory,
              compatibleVehicles: uniqueVehicles.size,
            });
          });
        }
      });
      
      // Fetch stock status only
      filteredProducts = await fetchStockStatus(filteredProducts);

      // Separate myTVS and other brands
      const myTvsProducts = filteredProducts.filter(p => 
        p.brandName?.toUpperCase() === "MYTVS"
      );
      const otherProducts = filteredProducts.filter(p => 
        p.brandName?.toUpperCase() !== "MYTVS"
      );

      setRecommendedProducts(myTvsProducts);
      setOtherBrandProducts(otherProducts);
      setTotalPartsCount(filteredProducts.length);

    } catch (err) {
      console.error("❌ Error applying filter:", err);
      setError("Failed to apply filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle vehicle selection from compatibility modal
  const handleVehicleSelection = async (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    
    const make = vehicle.vehicleMake || vehicle.make;
    const model = vehicle.vehicleModel || vehicle.model;
    const variant = vehicle.vehicleVariant || vehicle.variant;
    const fuelType = vehicle.vehicleFuelType || vehicle.fuelType;
    const year = vehicle.vehicleFromYear || vehicle.year;

    setSelectedMake(make || "");
    setSelectedModel(model || "");
    setSelectedVariant(variant || "");
    setSelectedFuel(fuelType || "");
    setSelectedYear(year ? year.toString() : "");

    // Apply filter with selected vehicle
    setLoading(true);
    try {
      // Build vehicle context for Unified Search API
      const vehicleContext = {};
      if (make) vehicleContext.make = make;
      if (model) vehicleContext.model = model;
      if (variant) vehicleContext.variant = variant;
      if (fuelType) vehicleContext.fuelType = fuelType;
      if (year) vehicleContext.year = parseInt(year);

      // Use Unified Search API with vehicle context (max limit is 50)
      const response = await partsmartTextSearchAPI({
        search_type: "text",
        query: searchKey,
        vehicle: vehicleContext,
        sources: ["tvs"],
        limit: 50
      });

      if (response?.data?.tvs) {
        // Transform response
        let filteredProducts = [];
        Object.entries(response.data.tvs).forEach(([partKey, parts]) => {
          if (Array.isArray(parts)) {
            // Count unique vehicles for this part group
            const uniqueVehicles = new Set();
            parts.forEach((part) => {
              const vehicleKey = `${part.vehicleMake}_${part.vehicleModel}_${part.vehicleVariant}_${part.vehicleFuelType}_${part.vehicleFromYear}`;
              uniqueVehicles.add(vehicleKey);
            });

            parts.forEach((part) => {
              filteredProducts.push({
                id: part.id || part.partNumber,
                partNumber: part.partNumber || part.part_number,
                brandName: part.brandName || part.brand,
                name: part.name || part.title || part.description,
                itemDescription: part.description || part.partDescription,
                listPrice: part.listPrice || part.list_price,
                mrp: part.mrp,
                imageUrl: part.image_url || NoImage,
                vehicleMake: part.vehicleMake || part.vehicle_make,
                vehicleModel: part.vehicleModel || part.vehicle_model,
                vehicleVariant: part.vehicleVariant || part.vehicle_variant,
                vehicleFuelType: part.vehicleFuelType || part.vehicle_fuel_type || part.fuelType,
                vehicleFromYear: part.vehicleFromYear || part.vehicle_from_year || part.year,
                vehicleToYear: part.vehicleToYear || part.vehicle_to_year,
                aggregate: part.aggregate || part.category,
                subAggregate: part.subAggregate || part.subcategory,
                compatibleVehicles: uniqueVehicles.size,
              });
            });
          }
        });
        
        filteredProducts = await fetchStockStatus(filteredProducts);

        const myTvsProducts = filteredProducts.filter(p => 
          p.brandName?.toUpperCase() === "MYTVS"
        );
        const otherProducts = filteredProducts.filter(p => 
          p.brandName?.toUpperCase() !== "MYTVS"
        );

        setRecommendedProducts(myTvsProducts);
        setOtherBrandProducts(otherProducts);
        setTotalPartsCount(filteredProducts.length);
      }

    } catch (err) {
      console.error("❌ Error filtering by vehicle:", err);
      setError("Failed to filter products.");
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedMake("");
    setSelectedModel("");
    setSelectedVariant("");
    setSelectedFuel("");
    setSelectedYear("");
    setRightFilters({ year: "", fuelType: "", eta: "" });
    
    // Reload original results
    window.location.reload();
  };

  // Apply right-side filters
  const applyRightFilters = () => {
    let filtered = [...recommendedProducts, ...otherBrandProducts];

    if (rightFilters.year) {
      filtered = filtered.filter(p => 
        p.vehicleFromYear?.toString() === rightFilters.year
      );
    }

    if (rightFilters.fuelType) {
      filtered = filtered.filter(p => 
        p.vehicleFuelType === rightFilters.fuelType
      );
    }

    if (rightFilters.eta) {
      // Apply ETA filter logic here
    }

    const myTvs = filtered.filter(p => p.brandName?.toUpperCase() === "MYTVS");
    const others = filtered.filter(p => p.brandName?.toUpperCase() !== "MYTVS");

    setRecommendedProducts(myTvs);
    setOtherBrandProducts(others);
  };

  useEffect(() => {
    if (rightFilters.year || rightFilters.fuelType || rightFilters.eta) {
      applyRightFilters();
    }
  }, [rightFilters]);

  // Build complete search key display with vehicle details
  const getCompleteSearchKey = () => {
    // Use the original search query if available, otherwise use searchKey
    let displayKey = originalSearchQuery || searchKey;
    
    // Add year if available and not already in the query
    if (initialVehicle.year && !displayKey.includes(initialVehicle.year.toString())) {
      displayKey += " " + initialVehicle.year;
    }
    
    return displayKey;
  };

  return (
    <div className="pn-wrapper">
      <Search />

      <div className="pn-body">
        <div className="pn-search-key">
          Search Key : <b>{getCompleteSearchKey()}</b>
          {totalPartsCount > 0 && (
            <span style={{ marginLeft: "10px" }}>
              Compatible with <b>{totalPartsCount.toLocaleString()}</b> items
            </span>
          )}
          {batchLoadingProgress && (
            <span style={{ marginLeft: "10px", color: "#007bff" }}>
              Loading: {batchLoadingProgress.current} / {batchLoadingProgress.total}
            </span>
          )}
        </div>

        {/* FILTERS */}
        <div className="pn-top">
          <div className="pn-compatibility">
            <select 
              className="pn-control-dropdown"
              value={selectedMake}
              onChange={async (e) => {
                const val = e.target.value;
                setSelectedMake(val);
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
                
                // Fetch models from lookup API
                if (val) {
                  try {
                    const apiService = (await import("../../../services/apiservice")).default;
                    const response = await apiService.post('/partsmart/search', {
                      search_type: "lookup",
                      lookup_type: "vehicle",
                      vehicle: { make: val },
                      limit: 50
                    });
                    
                    if (response?.data?.data?.models) {
                      setVehicleOptions(prev => ({
                        ...prev,
                        models: response.data.data.models,
                        variants: [],
                        fuelTypes: [],
                        years: []
                      }));
                    }
                  } catch (error) {
                    console.error("Error fetching models:", error);
                  }
                }
              }}
            >
              <option value="">Select Make</option>
              {vehicleOptions.makes.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedModel}
              onChange={async (e) => {
                const val = e.target.value;
                setSelectedModel(val);
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
                
                // Fetch variants, fuel types, and years from lookup API
                if (val && selectedMake) {
                  try {
                    const apiService = (await import("../../../services/apiservice")).default;
                    const response = await apiService.post('/partsmart/search', {
                      search_type: "lookup",
                      lookup_type: "vehicle",
                      vehicle: { make: selectedMake, model: val },
                      limit: 50
                    });
                    
                    const apiData = response?.data?.data || response?.data;
                    if (apiData) {
                      setVehicleOptions(prev => ({
                        ...prev,
                        variants: apiData.variants || [],
                        fuelTypes: apiData.fuel_types || [],
                        years: apiData.years?.map(y => y.toString()) || []
                      }));
                    }
                  } catch (error) {
                    console.error("Error fetching variants:", error);
                  }
                }
              }}
              disabled={!selectedMake}
            >
              <option value="">Select Model</option>
              {vehicleOptions.models.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedVariant}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVariant(val);
                setSelectedFuel("");
                setSelectedYear("");
              }}
              disabled={!selectedModel}
            >
              <option value="">Select Variant</option>
              {vehicleOptions.variants.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedFuel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFuel(val);
                setSelectedYear("");
              }}
              disabled={!selectedVariant}
            >
              <option value="">Select Fuel type</option>
              {vehicleOptions.fuelTypes.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val);
              }}
              disabled={!selectedFuel}
            >
              <option value="">Select Year</option>
              {vehicleOptions.years.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <button
              className="pn-clear-btn"
              onClick={clearAllFilters}
            >
              X
            </button>

            <button className="pn-search-btn" onClick={applyCompatibilityFilter}>
              Search
            </button>
          </div>

          <div className="pn-right-filters">
            <select
              className="pn-control-dropdown"
              value={rightFilters.year}
              onChange={(e) => setRightFilters({ ...rightFilters, year: e.target.value })}
            >
              <option value="">Year</option>
              {vehicleOptions.years.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              className="pn-control-dropdown"
              value={rightFilters.fuelType}
              onChange={(e) => setRightFilters({ ...rightFilters, fuelType: e.target.value })}
            >
              <option value="">Fuel Type</option>
              {vehicleOptions.fuelTypes.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              className="pn-control-dropdown"
              value={rightFilters.eta}
              onChange={(e) => setRightFilters({ ...rightFilters, eta: e.target.value })}
            >
              <option value="">ETA</option>
              <option value="1-2 Days">1-2 Days</option>
              <option value="3-5 Days">3-5 Days</option>
              <option value="1 Week">1 Week</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="pn-content">
          {loading && !batchLoadingProgress && (
            <div className="pn-loading">Loading products...</div>
          )}

          {!loading && error && (
            <div className="pn-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="pn-products-layout">
              {/* LEFT SIDE - 75% */}
              <div className="pn-left-section">
                <Product2
                  title="myTVS Recommended Products"
                  products={recommendedProducts.map(p => ({
                    id: p.id || p.partNumber,
                    brand: p.brandName || "myTVS",
                    partNumber: p.partNumber,
                    name: p.name || p.itemDescription,
                    price: parseFloat(p.listPrice) || 0,
                    mrp: parseFloat(p.mrp) || 0,
                    image: p.imageUrl || NoImage,
                    stockStatus: p.stockStatus || "Unknown",
                    deliveryTime: p.eta || "1-2 Days",
                    compatibleVehicles: p.compatibleVehicles || 0,
                    cartId: p.partNumber,
                  }))}
                  layout="horizontal"
                  onAddToCart={(product) => {
                    addToCart({
                      partNumber: product.cartId,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp,
                      brand: product.brand,
                      quantity: 1,
                    });
                  }}
                  onCompatibilityClick={handleCompatibilityClick}
                />

                <Product2
                  title="Other Brand Products"
                  products={otherBrandProducts.map(p => ({
                    id: p.id || p.partNumber,
                    brand: p.brandName || "Other",
                    partNumber: p.partNumber,
                    name: p.name || p.itemDescription,
                    price: parseFloat(p.listPrice) || 0,
                    mrp: parseFloat(p.mrp) || 0,
                    image: p.imageUrl || NoImage,
                    stockStatus: p.stockStatus || "Unknown",
                    deliveryTime: p.eta || "1-2 Days",
                    compatibleVehicles: p.compatibleVehicles || 0,
                    cartId: p.partNumber,
                  }))}
                  layout="horizontal"
                  onAddToCart={(product) => {
                    addToCart({
                      partNumber: product.cartId,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp,
                      brand: product.brand,
                      quantity: 1,
                    });
                  }}
                  onCompatibilityClick={handleCompatibilityClick}
                />
              </div>

              {/* RIGHT SIDE - 25% - ALIGNED PRODUCTS (COMMENTED OUT - NOT NEEDED) */}
              {/* <div className="pn-right-section">
                <Product1
                  title="Aligned Products"
                  products={alignedProducts.map(p => ({
                    id: p.id || p.partNumber,
                    brand: p.brandName || "myTVS",
                    partNumber: p.partNumber,
                    name: p.name || p.itemDescription,
                    price: parseFloat(p.listPrice) || 0,
                    mrp: parseFloat(p.mrp) || 0,
                    image: p.imageUrl || NoImage,
                    stockStatus: p.stockStatus || "Unknown",
                    deliveryTime: p.eta || "1-2 Days",
                    compatibleVehicles: p.compatibleVehicles || 0,
                    cartId: p.partNumber,
                  }))}
                  layout="vertical"
                  onAddToCart={(product) => {
                    addToCart({
                      partNumber: product.cartId,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp,
                      brand: product.brand,
                      quantity: 1,
                    });
                  }}
                  onCompatibilityClick={handleCompatibilityClick}
                />
              </div> */}
            </div>
          )}
        </div>
      </div>

      {showCompatibility && (
        <CompatibilityModal
          onClose={() => setShowCompatibility(false)}
          partNumber={selectedPartNumber}
          vehicles={selectedPartVehicles}
          onVehicleSelect={handleVehicleSelection}
        />
      )}
      
      <VehicleContextModal
        isOpen={vehicleModal.isOpen}
        onClose={() => setVehicleModal(prev => ({ ...prev, isOpen: false }))}
        searchQuery={vehicleModal.searchQuery}
        missingFields={vehicleModal.missingFields}
        extractedFields={vehicleModal.extractedFields}
        onSearchComplete={handleVehicleModalComplete}
      />
    </div>
  );
};

export default PartNumber;
