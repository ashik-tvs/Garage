import React, { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useVehicleContext } from "../../../contexts/VehicleContext";
import Search from "../../home/Search";
import { partsmartImageSearchAPI, externalStockAPI } from "../../../services/api";
import apiService from "../../../services/apiservice";
import serviceType from "../../../assets/vehicle_search_entry/servicetype.png";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/image/Image.css";
import "../../../styles/skeleton/skeleton.css";


const ImageSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicle, updateField } = useVehicleContext();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const isInCart = (code) => cartItems.some((item) => item.partNumber === code);

  // Image state
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [detectedPart, setDetectedPart] = useState("");
  
  // Search state
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  
  // Vehicle dropdown state
  const [dropdownOptions, setDropdownOptions] = useState({
    make: [],
    model: [],
    variant: [],
    fuelType: [],
    year: [],
  });
  
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    make: false,
    model: false,
    variant: false,
    fuelType: false,
    year: false,
  });

  // Helper function to fetch stock and ETA for products
  const fetchStockForProducts = async (productsList) => {
    // Static customer code and warehouse
    const customerCode = "NMSA0987";
    const warehouse = "PATNA";

    // Return all products with static "In Stock" status
    return productsList.map(product => ({
      ...product,
      stock: "In Stock",
      eta: "Same Day",
      stockQuantity: 10,
    }));
  };

  // Function to update URL with vehicle context
  const updateURLParams = (vehicleData, detectedPartName = null) => {
    const params = new URLSearchParams();
    
    if (vehicleData.make) params.set('make', vehicleData.make);
    if (vehicleData.model) params.set('model', vehicleData.model);
    if (vehicleData.variant) params.set('variant', vehicleData.variant);
    if (vehicleData.fuelType) params.set('fuelType', vehicleData.fuelType);
    if (vehicleData.year) params.set('year', vehicleData.year);
    if (detectedPartName) params.set('detectedPart', detectedPartName);
    
    setSearchParams(params, { replace: true });
  };

  // Handle image and vehicle context from navigation state or URL params
  useEffect(() => {
    const executeSearch = async () => {
      // First, check URL parameters for vehicle context
      const urlMake = searchParams.get('make');
      const urlModel = searchParams.get('model');
      const urlVariant = searchParams.get('variant');
      const urlFuelType = searchParams.get('fuelType');
      const urlYear = searchParams.get('year');
      const urlDetectedPart = searchParams.get('detectedPart');
      
      // Fetch dropdown options from lookup API if URL parameters are present
      if (urlMake || urlModel || urlVariant) {
        console.log("🔍 Fetching dropdown options from lookup API for URL params");
        
        try {
          // Fetch makes
          const makesResponse = await apiService.post('/partsmart/search', {
            search_type: "lookup",
            lookup_type: "vehicle",
            limit: 50
          });
          
          if (makesResponse?.data?.data?.makes) {
            setDropdownOptions(prev => ({
              ...prev,
              make: makesResponse.data.data.makes
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
              setDropdownOptions(prev => ({
                ...prev,
                model: modelsResponse.data.data.models
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
              setDropdownOptions(prev => ({
                ...prev,
                variant: apiData.variants || [],
                fuelType: apiData.fuel_types || [],
                year: apiData.years?.map(y => y.toString()) || []
              }));
            }
          }
          
          console.log("✅ Initial dropdown options loaded from lookup API");
        } catch (error) {
          console.error("❌ Error fetching initial dropdown options:", error);
        }
      }
      
      // Check if we have multipart results from navigation state
      if (location.state?.multipartResults) {
        console.log("📦 Multipart results received:", location.state.multipartResults);
        
        // Set image and detected part
        if (location.state.imageFile) {
          const file = location.state.imageFile;
          setUploadedFile(file);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
            sessionStorage.setItem('imageSearchPreview', reader.result);
          };
          reader.readAsDataURL(file);
        }
        
        setDetectedPart(location.state.detectedPart || "");
        
        // Set vehicle context
        const vehicleData = location.state.vehicle;
        if (vehicleData) {
          if (vehicleData.make) updateField('make', vehicleData.make);
          if (vehicleData.model) updateField('model', vehicleData.model);
          if (vehicleData.variant) updateField('variant', vehicleData.variant);
          if (vehicleData.fuelType) updateField('fuelType', vehicleData.fuelType);
          if (vehicleData.year) updateField('year', vehicleData.year);
          
          updateURLParams(vehicleData, location.state.detectedPart);
        }
        
        // Process multipart results
        processMultipartResults(location.state.multipartResults);
        
        // Fetch dropdown options
        if (vehicleData?.make) {
          fetchMakes();
          if (vehicleData.model) {
            fetchModels(vehicleData.make);
            await fetchVariantsAndDetails(vehicleData.make, vehicleData.model);
          }
        }
        
        return;
      }
      
      if (location.state?.imageFile && location.state?.vehicle) {
        // Image + vehicle context provided from modal
        const file = location.state.imageFile;
        setUploadedFile(file);
        
        // Convert File to base64 data URL for persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
          // Store in sessionStorage so it persists on reload
          sessionStorage.setItem('imageSearchPreview', reader.result);
          sessionStorage.setItem('imageSearchPart', location.state.detectedPart || '');
          sessionStorage.setItem('imageSearchVehicle', JSON.stringify(location.state.vehicle));
        };
        reader.readAsDataURL(file);
        
        setDetectedPart(location.state.detectedPart || "");
        
        // Pre-fill vehicle context from modal
        const vehicleData = location.state.vehicle;
        if (vehicleData.make) updateField('make', vehicleData.make);
        if (vehicleData.model) updateField('model', vehicleData.model);
        if (vehicleData.variant) updateField('variant', vehicleData.variant);
        if (vehicleData.fuelType) updateField('fuelType', vehicleData.fuelType);
        if (vehicleData.year) updateField('year', vehicleData.year);
        
        // Update URL with vehicle context
        updateURLParams(vehicleData, location.state.detectedPart);
        
        // Fetch dropdown options based on pre-filled values
        if (vehicleData.make) {
          fetchMakes(); // Load all makes
          if (vehicleData.model) {
            fetchModels(vehicleData.make); // Load models for this make
            
            // Await variants before searching
            const { variants } = await fetchVariantsAndDetails(vehicleData.make, vehicleData.model);
            console.log("✅ Variants loaded:", variants);
            
            // If variant exists in vehicle data, validate it against loaded variants
            if (vehicleData.variant && variants.length > 0) {
              const variantMatch = variants.find(v => 
                v.trim().toUpperCase() === vehicleData.variant.trim().toUpperCase()
              );
              
              if (!variantMatch) {
                console.warn(`⚠️ Variant "${vehicleData.variant}" not in valid list, will be excluded`);
                // Don't modify vehicleData here, let performImageSearch handle it
              }
            }
            
            // Perform search with variants list
            await performImageSearch(file, location.state.vehicle, variants);
            return;
          }
        }
        
        // Perform search without variants if no model
        await performImageSearch(file, location.state.vehicle, []);
      } else if (location.state?.imageFile) {
        // Only image provided (shouldn't happen with new flow, but keep as fallback)
        const file = location.state.imageFile;
        setUploadedFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
          sessionStorage.setItem('imageSearchPreview', reader.result);
        };
        reader.readAsDataURL(file);
        
        setDetectedPart(location.state.detectedPart || "");
        
        // Fetch makes for dropdown
        fetchMakes();
      } else if (urlMake || urlModel) {
        // Restore from URL parameters
        console.log("📍 Restoring from URL parameters");
        
        // First, fetch dropdown options BEFORE setting vehicle fields
        await fetchMakes();
        
        if (urlMake) {
          await fetchModels(urlMake);
          
          if (urlModel) {
            await fetchVariantsAndDetails(urlMake, urlModel);
          }
        }
        
        // Now set the vehicle fields after dropdown options are loaded
        if (urlMake) updateField('make', urlMake);
        if (urlModel) updateField('model', urlModel);
        if (urlVariant) updateField('variant', urlVariant);
        if (urlFuelType) updateField('fuelType', urlFuelType);
        if (urlYear) updateField('year', urlYear);
        if (urlDetectedPart) setDetectedPart(urlDetectedPart);
        
        // Try to restore image from sessionStorage
        const savedPreview = sessionStorage.getItem('imageSearchPreview');
        if (savedPreview) {
          setPreviewUrl(savedPreview);
        }
      } else {
        // Try to restore from sessionStorage on page reload
        const savedPreview = sessionStorage.getItem('imageSearchPreview');
        const savedPart = sessionStorage.getItem('imageSearchPart');
        const savedVehicle = sessionStorage.getItem('imageSearchVehicle');
        
        if (savedPreview) {
          setPreviewUrl(savedPreview);
        }
        
        if (savedPart) {
          setDetectedPart(savedPart);
        }
        
        if (savedVehicle) {
          const vehicleData = JSON.parse(savedVehicle);
          if (vehicleData.make) updateField('make', vehicleData.make);
          if (vehicleData.model) updateField('model', vehicleData.model);
          if (vehicleData.variant) updateField('variant', vehicleData.variant);
          if (vehicleData.fuelType) updateField('fuelType', vehicleData.fuelType);
          if (vehicleData.year) updateField('year', vehicleData.year);
          
          // Update URL with restored vehicle context
          updateURLParams(vehicleData, savedPart);
        }
        
        // Fetch makes for dropdown
        fetchMakes();
      }
    };

    executeSearch();
    
    // Cleanup function
    return () => {
      // Don't revoke data URLs from sessionStorage
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [location.state]);
  
  // Function to perform image search with vehicle context
  const performImageSearch = async (imageFile, vehicleContext, variantsList = []) => {
    setSearching(true);
    
    try {
      console.log("🔍 STEP 1: Detecting part from image...");
      console.log("🚗 Vehicle:", vehicleContext);
      
      // STEP 1: Image detection only (no catalog search)
      const detectionResult = await partsmartImageSearchAPI({
        image: imageFile,
        sources: ['tvs','boodmo','smart'],
        limitPerPart: 50
      });
      
      console.log("✅ Detection result:", detectionResult);
      
      // Extract detected part name
      const detectedPartName = detectionResult?.data?.ai_analysis?.detected_part;
      
      if (!detectedPartName) {
        console.error("❌ No part detected from image");
        alert("Could not detect part from image. Please try another image.");
        setSearching(false);
        return;
      }
      
      console.log("✅ Detected part:", detectedPartName);
      setDetectedPart(detectedPartName);
      
      // STEP 2: Build structured query for multipart search
      // Format: "MAKE MODEL VARIANT FUELTYPE YEAR PARTNAME"
      const queryParts = [];
      if (vehicleContext.make) queryParts.push(vehicleContext.make.toUpperCase());
      if (vehicleContext.model) queryParts.push(vehicleContext.model.toUpperCase());
      if (vehicleContext.variant) queryParts.push(vehicleContext.variant.toUpperCase());
      if (vehicleContext.fuelType) queryParts.push(vehicleContext.fuelType.toUpperCase());
      if (vehicleContext.year) queryParts.push(vehicleContext.year.toString());
      queryParts.push(detectedPartName.toUpperCase());
      
      const structuredQuery = queryParts.join(' ');
      console.log("📝 Structured query:", structuredQuery);
      
      // Build vehicle object for multipart API
      const vehicleData = {
        make: vehicleContext.make,
        model: vehicleContext.model
      };
      
      if (vehicleContext.variant) vehicleData.variant = vehicleContext.variant;
      if (vehicleContext.fuelType) vehicleData.fuelType = vehicleContext.fuelType;
      if (vehicleContext.year) vehicleData.year = Number(vehicleContext.year);
      
      console.log("🔍 STEP 2: Searching catalog with multipart API...");
      console.log("📡 Query:", structuredQuery);
      console.log("📡 Vehicle:", vehicleData);
      
      // STEP 3: Call multipart search API
      let searchResult = await apiService.post('/partsmart/search', {
        search_type: 'multipart',
        query: structuredQuery,
        vehicle: vehicleData,
        sources: ['tvs','boodmo','smart'],
        limitPerPart: 50
      });
      
      console.log("✅ Multipart search result:", searchResult);
      
      // Check for validation errors and retry with NLP only (no vehicle object)
      if (searchResult?.data?.error?.code === 'VALIDATION_ERROR') {
        console.warn("⚠️ Validation error in performImageSearch, retrying with NLP only");
        
        // Retry with just the query - let NLP extract vehicle info
        searchResult = await apiService.post('/partsmart/search', {
          search_type: 'multipart',
          query: structuredQuery,
          sources: ['tvs','boodmo','smart'],
          limitPerPart: 50
        });
        
        console.log("✅ Retry search result (NLP only):", searchResult);
      }
      
      // Extract products from multipart response
      if (searchResult?.data?.data?.tvs) {
        let allProducts = [];
        
        Object.entries(searchResult.data.data.tvs).forEach(([partKey, parts]) => {
          if (Array.isArray(parts)) {
            parts.forEach((part) => {
              allProducts.push({
                id: part.id || part.partNumber,
                code: part.partNumber || part.part_number,
                partNumber: part.partNumber || part.part_number,
                brand: part.brandName || part.brand,
                brandName: part.brandName || part.brand,
                title: part.name || part.title || part.description,
                partDescription: part.partDescription || part.description || part.name || part.title,
                price: part.listPrice || part.list_price,
                listPrice: part.listPrice || part.list_price,
                mrp: part.mrp,
                stock: "In Stock",
                eta: "Same Day",
                vehicle: `${part.vehicleModel || ''} ${part.vehicleVariant || ''}`.trim(),
                fuel: part.vehicleFuelType || part.fuelType,
                year: part.vehicleFromYear || part.year,
                imageUrl: part.image_url || NoImage,
                make: part.vehicleMake,
                model: part.vehicleModel
              });
            });
          }
        });
        
        console.log(`✅ Total products found: ${allProducts.length}`);
        
        // Separate myTVS and other brands (including VALEO in recommended)
        const myTvsProducts = allProducts.filter(p => 
          p.brand?.toUpperCase() === "MYTVS" || p.brand?.toUpperCase() === "VALEO"
        );
        const otherBrands = allProducts.filter(p => 
          p.brand?.toUpperCase() !== "MYTVS" && p.brand?.toUpperCase() !== "VALEO"
        );
        
        setProducts(myTvsProducts);
        setOtherProducts(otherBrands);
      } else {
        console.warn("⚠️ No products found in search result");
        setProducts([]);
        setOtherProducts([]);
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };
  
  // Fetch makes on component mount
  useEffect(() => {
    fetchMakes();
  }, []);
  
  // Function to process multipart search results
  const processMultipartResults = (multipartResult) => {
    console.log("📦 Processing multipart results:", multipartResult);
    
    // Check for errors first
    if (!multipartResult?.success) {
      console.error("❌ Multipart search failed");
      console.error("📋 Error:", multipartResult?.error);
      console.error("📋 Summary:", multipartResult?.summary);
      setProducts([]);
      setOtherProducts([]);
      return;
    }
    
    try {
      // Multipart response structure: { success: true, data: { data: { tvs: { part1: [...], part2: [...] }, boodmo: {...} } } }
      const resultData = multipartResult?.data?.data || multipartResult?.data;
      
      if (!resultData) {
        console.warn("⚠️ No data in multipart results");
        setProducts([]);
        setOtherProducts([]);
        return;
      }
      
      let allProducts = [];
      
      // Process each source (tvs, boodmo)
      Object.entries(resultData).forEach(([source, sourceData]) => {
        console.log(`📦 Processing source: ${source}`, sourceData);
        
        // Each source has parts grouped by part name
        if (sourceData && typeof sourceData === 'object') {
          Object.entries(sourceData).forEach(([partKey, parts]) => {
            if (Array.isArray(parts)) {
              parts.forEach((part) => {
                allProducts.push({
                  id: part.id || part.partNumber,
                  code: part.partNumber || part.part_number,
                  partNumber: part.partNumber || part.part_number,
                  brand: part.brandName || part.brand,
                  brandName: part.brandName || part.brand,
                  title: part.name || part.title || part.description,
                  partDescription: part.partDescription || part.description || part.name || part.title,
                  price: part.listPrice || part.list_price,
                  listPrice: part.listPrice || part.list_price,
                  mrp: part.mrp,
                  stock: "In Stock",
                  eta: "Same Day",
                  vehicle: `${part.vehicleModel || ''} ${part.vehicleVariant || ''}`.trim(),
                  fuel: part.vehicleFuelType || part.fuelType,
                  year: part.vehicleFromYear || part.year,
                  imageUrl: part.image_url || NoImage,
                  make: part.vehicleMake,
                  model: part.vehicleModel,
                  source: source
                });
              });
            }
          });
        }
      });
      
      console.log("✅ Total products extracted:", allProducts.length);
      
      // Separate myTVS and other brands (including VALEO in recommended)
      const myTvsProducts = allProducts.filter(p => 
        p.brand?.toUpperCase() === "MYTVS" || p.brand?.toUpperCase() === "VALEO"
      );
      const otherBrands = allProducts.filter(p => 
        p.brand?.toUpperCase() !== "MYTVS" && p.brand?.toUpperCase() !== "VALEO"
      );
      
      setProducts(myTvsProducts);
      setOtherProducts(otherBrands);
      
      console.log(`✅ myTVS products: ${myTvsProducts.length}, Other brands: ${otherBrands.length}`);
    } catch (error) {
      console.error("❌ Error processing multipart results:", error);
      setProducts([]);
      setOtherProducts([]);
    }
  };
  
  const fetchMakes = async () => {
    setLoadingDropdowns(prev => ({ ...prev, make: true }));
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        limit: 50
      });
      
      if (response?.data?.data?.makes) {
        setDropdownOptions(prev => ({
          ...prev,
          make: response.data.data.makes
        }));
      }
    } catch (error) {
      console.error("Error fetching makes:", error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, make: false }));
    }
  };
  
  const fetchModels = async (make) => {
    setLoadingDropdowns(prev => ({ ...prev, model: true }));
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        vehicle: { make },
        limit: 50
      });
      
      if (response?.data?.data?.models) {
        setDropdownOptions(prev => ({
          ...prev,
          model: response.data.data.models,
          variant: [],
          fuelType: [],
          year: []
        }));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, model: false }));
    }
  };
  
  const fetchVariantsAndDetails = async (make, model) => {
    setLoadingDropdowns(prev => ({ ...prev, variant: true, fuelType: true, year: true }));
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        vehicle: { make, model },
        limit: 50
      });
      
      const apiData = response?.data?.data || response?.data;
      const variants = apiData?.variants || [];
      const fuelTypes = apiData?.fuel_types || [];
      const years = apiData?.years?.map(y => y.toString()) || [];
      
      if (apiData) {
        setDropdownOptions(prev => ({
          ...prev,
          variant: variants,
          fuelType: fuelTypes,
          year: years
        }));
      }
      
      // Return the variants list for immediate use
      return {
        variants,
        fuelTypes,
        years
      };
    } catch (error) {
      console.error("Error fetching variants:", error);
      return {
        variants: [],
        fuelTypes: [],
        years: []
      };
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, variant: false, fuelType: false, year: false }));
    }
  };
  
  const handleVehicleFieldChange = async (field, value) => {
    updateField(field, value);
    
    // Fetch dependent dropdowns based on what changed
    if (field === 'make' && value) {
      // When make changes, fetch models and reset dependent fields
      await fetchModels(value);
      updateField('model', null);
      updateField('variant', null);
      updateField('fuelType', null);
      updateField('year', null);
    } else if (field === 'model' && value && vehicle.make) {
      // When model changes, fetch variants/fuel/years and reset dependent fields
      await fetchVariantsAndDetails(vehicle.make, value);
      updateField('variant', null);
      updateField('fuelType', null);
      updateField('year', null);
    }
  };
  
  const handleSearch = async () => {
    if (!uploadedFile) {
      alert("Please upload an image first");
      return;
    }
    
    if (!vehicle.make || !vehicle.model) {
      alert("Please select at least Make and Model");
      return;
    }
    
    setSearching(true);
    
    try {
      console.log("🔍 STEP 1: Detecting part from image...");
      
      // STEP 1: Image detection only (no catalog search)
      const detectionResult = await partsmartImageSearchAPI({
        image: uploadedFile,
        sources: ['tvs'],
        limitPerPart: 50
      });
      
      console.log("✅ Detection result:", detectionResult);
      
      // Extract detected part name
      const detectedPartName = detectionResult?.data?.ai_analysis?.detected_part;
      
      if (!detectedPartName) {
        console.error("❌ No part detected from image");
        alert("Could not detect part from image. Please try another image.");
        setSearching(false);
        return;
      }
      
      console.log("✅ Detected part:", detectedPartName);
      setDetectedPart(detectedPartName);
      
      // Update URL with detected part
      const vehicleContext = {
        make: vehicle.make,
        model: vehicle.model
      };
      if (vehicle.variant) vehicleContext.variant = vehicle.variant;
      if (vehicle.fuelType) vehicleContext.fuelType = vehicle.fuelType;
      if (vehicle.year) vehicleContext.year = vehicle.year;
      
      updateURLParams(vehicleContext, detectedPartName);
      
      // STEP 2: Build structured query for multipart search
      // Format: "MAKE MODEL VARIANT FUELTYPE YEAR PARTNAME"
      const queryParts = [];
      if (vehicle.make) queryParts.push(vehicle.make.toUpperCase());
      if (vehicle.model) queryParts.push(vehicle.model.toUpperCase());
      if (vehicle.variant) queryParts.push(vehicle.variant.toUpperCase());
      if (vehicle.fuelType) queryParts.push(vehicle.fuelType.toUpperCase());
      if (vehicle.year) queryParts.push(vehicle.year.toString());
      queryParts.push(detectedPartName.toUpperCase());
      
      const structuredQuery = queryParts.join(' ');
      console.log("📝 Structured query:", structuredQuery);
      
      // Build vehicle object for multipart API
      const vehicleData = {
        make: vehicle.make,
        model: vehicle.model
      };
      
      if (vehicle.variant) vehicleData.variant = vehicle.variant;
      if (vehicle.fuelType) vehicleData.fuelType = vehicle.fuelType;
      if (vehicle.year) vehicleData.year = Number(vehicle.year);
      
      console.log("🔍 STEP 2: Searching catalog with multipart API...");
      console.log("📡 Query:", structuredQuery);
      console.log("📡 Vehicle:", vehicleData);
      
      // STEP 3: Call multipart search API
      let searchResult = await apiService.post('/partsmart/search', {
        search_type: 'multipart',
        query: structuredQuery,
        vehicle: vehicleData,
        sources: ['tvs'],
        limitPerPart: 50
      });
      
      console.log("✅ Multipart search result:", searchResult);
      
      // Check for validation errors and retry with NLP only (no vehicle object)
      if (searchResult?.data?.error?.code === 'VALIDATION_ERROR') {
        console.warn("⚠️ Validation error in handleSearch, retrying with NLP only");
        
        // Retry with just the query - let NLP extract vehicle info
        searchResult = await apiService.post('/partsmart/search', {
          search_type: 'multipart',
          query: structuredQuery,
          sources: ['tvs'],
          limitPerPart: 50
        });
        
        console.log("✅ Retry search result (NLP only):", searchResult);
      }
      
      // Extract products from multipart response
      if (searchResult?.data?.data?.tvs) {
        let allProducts = [];
        
        Object.entries(searchResult.data.data.tvs).forEach(([partKey, parts]) => {
          if (Array.isArray(parts)) {
            parts.forEach((part) => {
              allProducts.push({
                id: part.id || part.partNumber,
                code: part.partNumber || part.part_number,
                partNumber: part.partNumber || part.part_number,
                brand: part.brandName || part.brand,
                brandName: part.brandName || part.brand,
                title: part.name || part.title || part.description,
                partDescription: part.partDescription || part.description || part.name || part.title,
                price: part.listPrice || part.list_price,
                listPrice: part.listPrice || part.list_price,
                mrp: part.mrp,
                stock: "In Stock",
                eta: "Same Day",
                vehicle: `${part.vehicleModel || ''} ${part.vehicleVariant || ''}`.trim(),
                fuel: part.vehicleFuelType || part.fuelType,
                year: part.vehicleFromYear || part.year,
                imageUrl: part.image_url || NoImage,
                make: part.vehicleMake,
                model: part.vehicleModel
              });
            });
          }
        });
        
        console.log(`✅ Total products found: ${allProducts.length}`);
        
        // Separate myTVS and other brands (including VALEO in recommended)
        const myTvsProducts = allProducts.filter(p => 
          p.brand?.toUpperCase() === "MYTVS" || p.brand?.toUpperCase() === "VALEO"
        );
        const otherBrands = allProducts.filter(p => 
          p.brand?.toUpperCase() !== "MYTVS" && p.brand?.toUpperCase() !== "VALEO"
        );
        
        setProducts(myTvsProducts);
        setOtherProducts(otherBrands);
      } else {
        console.warn("⚠️ No products found in search result");
        setProducts([]);
        setOtherProducts([]);
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="img-page">
      <Search />

      {/* Upload Card */}
      <div className="img-upload-card">
        {/* LEFT IMAGE - Display only, no upload */}
        <div className="img-left">
          {previewUrl ? (
            <img src={previewUrl} alt="uploaded preview" />
          ) : (
            <div className="img-placeholder">No Image</div>
          )}
          {detectedPart && (
            <div className="img-detected">
              <span className="img-detected-label">Detected:</span>
              <span className="img-detected-value">{detectedPart}</span>
            </div>
          )}
        </div>

        {/* RIGHT FORM */}
        <div className="img-right">
          <div className="img-or">Select Vehicle Details</div>

          <div className="img-form">
            <div className="img-field">
              <label>Make *</label>
              <select 
                value={vehicle.make || ""}
                onChange={(e) => handleVehicleFieldChange('make', e.target.value)}
                disabled={loadingDropdowns.make}
              >
                <option value="">Select Make</option>
                {dropdownOptions.make.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="img-field">
              <label>Model *</label>
              <select
                value={vehicle.model || ""}
                onChange={(e) => handleVehicleFieldChange('model', e.target.value)}
                disabled={!vehicle.make || loadingDropdowns.model}
              >
                <option value="">Select Model</option>
                {dropdownOptions.model.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="img-field">
              <label>Variant</label>
              <select
                value={vehicle.variant || ""}
                onChange={(e) => handleVehicleFieldChange('variant', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.variant}
              >
                <option value="">Select Variant</option>
                {dropdownOptions.variant.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="img-field">
              <label>Fuel type</label>
              <select
                value={vehicle.fuelType || ""}
                onChange={(e) => handleVehicleFieldChange('fuelType', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.fuelType}
              >
                <option value="">Select Fuel Type</option>
                {dropdownOptions.fuelType.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="img-field">
              <label>Year</label>
              <select
                value={vehicle.year || ""}
                onChange={(e) => handleVehicleFieldChange('year', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.year}
              >
                <option value="">Select Year</option>
                {dropdownOptions.year.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="img-field img-search">
              <button onClick={handleSearch} disabled={searching || loading || !uploadedFile || !vehicle.make || !vehicle.model}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="img-content">
        {/* LEFT PRODUCTS */}
        <div className="img-products">
          {/* Header */}
          <div className="img-header">
            <h3>myTVS Recommended Products ({products.length})</h3>

            <div className="img-filters">
              <select>
                <option>Year</option>
              </select>
              <select>
                <option>Fuel type</option>
              </select>
              <select>
                <option>ETA</option>
              </select>
              <select>
                <option>Sort by</option>
              </select>
            </div>
          </div>

          {/* Recommended Products */}
          {searching ? (
            <div className="img-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="img-card skeleton-card">
                  {/* Image */}
                  <div className="img-card-image">
                    <div className="skeleton skeleton-pn-image"></div>
                  </div>

                  {/* Card Body */}
                  <div className="img-card-body">
                    {/* Badges */}
                    <div className="img-tags">
                      <div className="skeleton skeleton-pn-tag"></div>
                      <div className="skeleton skeleton-pn-tag"></div>
                      <div className="skeleton skeleton-pn-tag"></div>
                    </div>

                    {/* Code */}
                    <div className="skeleton skeleton-pn-part-code"></div>

                    {/* Title */}
                    <div className="skeleton skeleton-pn-name"></div>

                    {/* Price row */}
                    <div className="img-price-row">
                      <div className="skeleton skeleton-pn-price"></div>
                      <div className="skeleton skeleton-pn-mrp"></div>
                      <div className="skeleton skeleton-pn-button"></div>
                    </div>

                    {/* Meta */}
                    <div className="img-meta">
                      <div className="skeleton skeleton-pn-tag"></div>
                      <div className="skeleton skeleton-pn-tag"></div>
                      <div className="skeleton skeleton-pn-tag"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="img-grid">
              {products.map((p, idx) => (
                <div key={p.partNumber || idx} className="img-card">
                  {/* Image */}
                  <div className="img-card-image">
                    <img
                      src={p.imageUrl || NoImage}
                      alt={p.partDescription}
                      onError={(e) => { e.target.src = NoImage; }}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="img-card-body">
                    {/* Badges */}
                    <div className="img-tags">
                      <span className="tag brand">{p.brand || 'myTVS'}</span>
                      <span className="tag stock">In Stock</span>
                      <span className="tag eta">Same Day</span>
                    </div>

                    {/* Code */}
                    <p className="img-code">{p.partNumber}</p>

                    {/* Title */}
                    <p className="img-title" title={p.partDescription}>
                      {p.partDescription}
                    </p>

                    {/* Price row */}
                    <div className="img-price-row">
                      <span className="price">₹ {p.listPrice || p.price}</span>
                      {p.mrp && <del>₹ {p.mrp}</del>}
                      <button
                        className={`img-add ${isInCart(p.partNumber) ? "added" : ""}`}
                        onClick={() => {
                          if (isInCart(p.partNumber)) {
                            removeFromCart(p.partNumber);
                          } else {
                            addToCart({
                              partNumber: p.partNumber,
                              title: p.partDescription,
                              brand: p.brand || 'myTVS',
                              listPrice: p.listPrice || p.price,
                              mrp: p.mrp,
                              image: p.imageUrl || NoImage,
                            });
                          }
                        }}
                      >
                        {isInCart(p.partNumber) ? "Added" : "Add"}
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="img-meta">
                      {p.make && <span>{p.make}</span>}
                      {p.model && <span>{p.model}</span>}
                      {p.year && <span>{p.year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No products found. Upload an image and select vehicle details to search.
            </div>
          )}

          {/* Other Products */}
          {otherProducts.length > 0 && (
            <>
              <h3 className="img-other-title">Other Products ({otherProducts.length})</h3>

              <div className="img-grid">
                {otherProducts.map((p, idx) => (
                  <div key={`o-${p.partNumber || idx}`} className="img-card">
                    <div className="img-card-image">
                      <img
                        src={p.imageUrl || NoImage}
                        alt={p.partDescription}
                        onError={(e) => { e.target.src = NoImage; }}
                      />
                    </div>

                    <div className="img-card-body">
                      <div className="img-tags">
                        <span className="tag brand">{p.brand || 'Valeo'}</span>
                        <span className="tag stock">In Stock</span>
                        <span className="tag eta">Same Day</span>
                      </div>

                      <p className="img-code">{p.partNumber}</p>
                      <p className="img-title">{p.partDescription}</p>

                      <div className="img-price-row">
                        <span className="price">₹ {p.listPrice || p.price}</span>
                        {p.mrp && <del>₹ {p.mrp}</del>}
                        <button
                          className={`img-add ${isInCart(p.partNumber) ? "added" : ""}`}
                          onClick={() => {
                            if (isInCart(p.partNumber)) {
                              removeFromCart(p.partNumber);
                            } else {
                              addToCart({
                                partNumber: p.partNumber,
                                title: p.partDescription,
                                brand: p.brand || 'Valeo',
                                listPrice: p.listPrice || p.price,
                                mrp: p.mrp,
                                image: p.imageUrl || NoImage,
                              });
                            }
                          }}
                        >
                          {isInCart(p.partNumber) ? "Added" : "Add"}
                        </button>
                      </div>

                      <div className="img-meta">
                        {p.make && <span>{p.make}</span>}
                        {p.model && <span>{p.model}</span>}
                        {p.year && <span>{p.year}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR - SERVICE TYPE (COMMENTED OUT - NOT NEEDED) */}
        {/* <div className="img-sidebar">
          <div className="img-sidebar-header">
            <div>Service Type for {detectedPart || "Parts"}</div>
            <div>
              <img
                src={serviceType}
                alt="icon"
                className="img-sidebar-header-icon"
              ></img>
            </div>
          </div>

          <ul className="img-sidebar-list">
            <li>Complete {detectedPart || "Part"} System Inspection</li>
            <li>{detectedPart || "Part"} Noise / Vibration Diagnosis</li>
            <li>{detectedPart || "Part"} Condition Check</li>
            <li>Warning Light Check</li>
            <li>Front {detectedPart || "Part"} Replacement</li>
            <li>Rear {detectedPart || "Part"} Replacement</li>
            <li>{detectedPart || "Part"} Cleaning & Adjustment</li>
            <li>{detectedPart || "Part"} Installation Service</li>
            <li>Complete {detectedPart || "Part"} Assembly</li>
            <li>{detectedPart || "Part"} Maintenance Service</li>
            <li>Emergency {detectedPart || "Part"} Repair</li>
            <li>{detectedPart || "Part"} Performance Check</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default ImageSearch;

