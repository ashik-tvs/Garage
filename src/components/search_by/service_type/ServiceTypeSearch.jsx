  import React, { useEffect, useState } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import Search from "../../home/Search";
  import Navigation from "../../Navigation/Navigation";
  import apiService from "../../../services/apiservice";
  import { masterListAPI } from "../../../services/api";
  import OciImage from "../../oci_image/ociImages";
  import NoImage from "../../../assets/No Image.png";
  import "../../../styles/search_by/service_type/ServiceTypeSearch.css";

  const BASE_PAYLOAD = {
    partNumber: null,
    sortOrder: "ASC",
    customerCode: "0046",
    aggregate: null,
    brand: null,
    fuelType: null,
    limit: 50,
    make: null,
    masterType: null,
    model: null,
    offset: 0,
    primary: false,
    subAggregate: null,
    variant: null,
    year: null,
  };

  const ServiceTypeSearch = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const searchKey = state?.serviceType || "";

    /* ===================== STATE ===================== */
    const [vehicleNumber, setVehicleNumber] = useState("");

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [variants, setVariants] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [years, setYears] = useState([]);

    const [selectedMake, setSelectedMake] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedVariant, setSelectedVariant] = useState("");
    const [selectedFuel, setSelectedFuel] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    /* ===================== API HELPER ===================== */
    const fetchMasterData = async (overrides, setter) => {
      try {
        const payload = { ...BASE_PAYLOAD, ...overrides };
        const res = await masterListAPI(payload);

        if (res?.success && Array.isArray(res.data)) {
          setter(res.data);
        } else {
          setter([]);
        }
      } catch (err) {
        console.error("❌ Filter API error:", err);
        setter([]);
      }
    };

    /* ===================== LOAD MAKES ===================== */
    useEffect(() => {
      fetchMasterData({ masterType: "make" }, setMakes);
    }, []);

    /* ===================== HANDLERS ===================== */
    const handleMakeChange = (e) => {
      const make = e.target.value;
      setSelectedMake(make);

      setModels([]);
      setVariants([]);
      setFuelTypes([]);
      setYears([]);

      setSelectedModel("");
      setSelectedVariant("");
      setSelectedFuel("");
      setSelectedYear("");

      if (make) {
        fetchMasterData(
          { masterType: "model", make },
          setModels
        );
      }
    };

    const handleModelChange = (e) => {
      const model = e.target.value;
      setSelectedModel(model);

      setVariants([]);
      setFuelTypes([]);
      setYears([]);

      setSelectedVariant("");
      setSelectedFuel("");
      setSelectedYear("");

      if (model) {
        fetchMasterData(
          { masterType: "variant", make: selectedMake, model },
          setVariants
        );
      }
    };

    const handleVariantChange = (e) => {
      const variant = e.target.value;
      setSelectedVariant(variant);

      setFuelTypes([]);
      setYears([]);

      setSelectedFuel("");
      setSelectedYear("");

      if (variant) {
        fetchMasterData(
          {
            masterType: "fuelType",
            make: selectedMake,
            model: selectedModel,
            variant,
          },
          setFuelTypes
        );
      }
    };

    const handleFuelChange = (e) => {
      const fuel = e.target.value;
      setSelectedFuel(fuel);

      setYears([]);
      setSelectedYear("");

      if (fuel) {
        fetchMasterData(
          {
            masterType: "year",
            make: selectedMake,
            model: selectedModel,
            variant: selectedVariant,
            fuelType: fuel,
          },
          setYears
        );
      }
    };

    const handleMakeClick = (makeName) => {
      setSelectedMake(makeName);

      fetchMasterData(
        { masterType: "model", make: makeName },
        setModels
      );

      navigate("/service-type-model", {
        state: { make: makeName, serviceType: searchKey },
      });
    };

    const handleFindAutoParts = () => {
      navigate("/service-type-products", {
        state: {
          serviceType: searchKey,
          make: selectedMake,
          model: selectedModel,
          variant: selectedVariant,
          fuelType: selectedFuel,
          year: selectedYear,
        },
      });
    };

    /* ===================== VEHICLE NUMBER ===================== */
    const formatVehicleNumber = (value) => {
      const raw = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      return raw.replace(
        /^(.{2})(.{2})(.{2})(.{0,4}).*/,
        (_, a, b, c, d) => `${a} - ${b} - ${c}${d ? " - " + d : ""}`
      );
    };

    const handleVehicleChange = (e) => {
      setVehicleNumber(formatVehicleNumber(e.target.value));
    };

    /* ===================== JSX (UNCHANGED STRUCTURE) ===================== */
    return (
      <div className="st-s-service-type-search">
        <Search />
        <Navigation />

        {searchKey && (
          <div className="vne-search-key-text">
            <span className="srp-search-key-label">Search Key : </span>
            <span className="srp-search-key-value">{searchKey}</span>
          </div>
        )}

        <div className="st-s-filter-container">
          <div className="st-s-row-center">
            <div className="st-s-vehicle-number-search">
              <input
                type="text"
                placeholder="TN  -  59  -  CS  -  3866"
                className="st-s-vehicle-input"
                value={vehicleNumber}
                onChange={handleVehicleChange}
                maxLength={19}
              />
              <button className="st-s-search-btn">Search</button>
            </div>

            <div className="st-s-or-text">(OR)</div>

            <div className="st-s-filters">
              <select className="st-s-filter-dropdown" onChange={handleMakeChange}>
                <option value="">Select Make</option>
                {makes.map((m, i) => (
                  <option key={i} value={m.masterName}>
                    {m.masterName}
                  </option>
                ))}
              </select>

              <select
                className="st-s-filter-dropdown"
                onChange={handleModelChange}
                disabled={!selectedMake}
              >
                <option value="">Select Model</option>
                {models.map((m, i) => (
                  <option key={i} value={m.masterName}>
                    {m.masterName}
                  </option>
                ))}
              </select>

              <select
                className="st-s-filter-dropdown"
                onChange={handleVariantChange}
                disabled={!selectedModel}
              >
                <option value="">Select Variant</option>
                {variants.map((v, i) => (
                  <option key={i} value={v.masterName}>
                    {v.masterName}
                  </option>
                ))}
              </select>

              <select
                className="st-s-filter-dropdown"
                onChange={handleFuelChange}
                disabled={!selectedVariant}
              >
                <option value="">Select Fuel Type</option>
                {fuelTypes.map((f, i) => (
                  <option key={i} value={f.masterName}>
                    {f.masterName}
                  </option>
                ))}
              </select>

              <select
                className="st-s-filter-dropdown"
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedFuel}
              >
                <option value="">Select Year</option>
                {years.map((y, i) => (
                  <option key={i} value={y.masterName}>
                    {y.masterName}
                  </option>
                ))}
              </select>

              <button className="st-s-find-btn" onClick={handleFindAutoParts}>
                Find Auto Parts
              </button>
            </div>
          </div>
        </div>

        <div className="st-s-make-grid-container">
          <p className="st-s-make-title">Search by Make (OR)</p>
          <div className="st-s-make-grid">
            {makes.map((make, index) => (
              <div
                key={index}
                className="st-s-make-card"
                onClick={() => handleMakeClick(make.masterName)}
              >
                <OciImage
                  partNumber={make.masterName}
                  folder="make"
                  fallbackImage={NoImage}
                  className="st-s-make-logo"
                  alt={make.masterName}
                />
                <p className="st-s-make-name">{make.masterName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default ServiceTypeSearch;
