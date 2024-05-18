import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedSalt, setSelectedSalt] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedStrength, setSelectedStrength] = useState(null);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [formOptions, setFormOptions] = useState([]);
  const [strengthOptions, setStrengthOptions] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedSalt) {
      const formKeys = Object.keys(selectedSalt.salt_forms_json).filter(form =>
        Object.keys(selectedSalt.salt_forms_json[form]).some(strength =>
          Object.keys(selectedSalt.salt_forms_json[form][strength]).some(packing =>
            selectedSalt.salt_forms_json[form][strength][packing]
          )
        )
      );
      setFormOptions(formKeys);
      if (formKeys.length > 0) {
        setSelectedForm(formKeys[0]);
      }
    }
  }, [selectedSalt]);

  useEffect(() => {
    if (selectedForm) {
      const strengthKeys = Object.keys(selectedSalt.salt_forms_json[selectedForm]).filter(strength =>
        Object.keys(selectedSalt.salt_forms_json[selectedForm][strength]).some(packing =>
          selectedSalt.salt_forms_json[selectedForm][strength][packing]
        )
      );
      setStrengthOptions(strengthKeys);
      if (strengthKeys.length > 0) {
        setSelectedStrength(strengthKeys[0]);
      }
    }
  }, [selectedForm, selectedSalt]);

  useEffect(() => {
    if (selectedStrength) {
      const packingKeys = Object.keys(selectedSalt.salt_forms_json[selectedForm][selectedStrength]).filter(packing =>
        selectedSalt.salt_forms_json[selectedForm][selectedStrength][packing]
      );
      setPackingOptions(packingKeys);
      if (packingKeys.length > 0) {
        setSelectedPacking(packingKeys[0]);
      }
    }
  }, [selectedStrength, selectedForm, selectedSalt]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://backend.cappsule.co.in/api/v1/new_search?q=${query}&pharmacyIds=1,2,3`);
      const data = response.data.data.saltSuggestions;
      setResults(data);
      if (data.length > 0) {
        setSelectedSalt(data[0]);
      } else {
        setSelectedSalt(null);
      }
      setError('');
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
    }
  };

  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  const handleStrengthSelect = (strength) => {
    setSelectedStrength(strength);
  };

  const handlePackingSelect = (packing) => {
    setSelectedPacking(packing);
  };

  const getLowestPrice = () => {
    if (selectedSalt && selectedForm && selectedStrength && selectedPacking) {
      const products = selectedSalt.salt_forms_json[selectedForm][selectedStrength][selectedPacking];
      if (products && products.length > 0) {
        const prices = products.flatMap(product => product.map(p => p.selling_price));
        return Math.min(...prices);
      }
    }
    return null;
  };

  return (
    <div className="App">
      <h1>Cappsule web development test</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter salt name"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p>{error}</p>}
      <div className="results-container">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <div className="left-column">
              <div className="form-container">
                <h3>Form:</h3>
                {formOptions.map((form) => (
                  <button
                    key={form}
                    className={selectedForm === form ? 'selected' : ''}
                    onClick={() => handleFormSelect(form)}
                  >
                    {form}
                  </button>
                ))}
              </div>
              <div className="strength-container">
                <h3>Strength:</h3>
                {strengthOptions.map((strength) => (
                  <button
                    key={strength}
                    className={selectedStrength === strength ? 'selected' : ''}
                    onClick={() => handleStrengthSelect(strength)}
                  >
                    {strength}
                  </button>
                ))}
              </div>
              <div className="packing-container">
                <h3>Packing:</h3>
                {packingOptions.map((packing) => (
                  <button
                    key={packing}
                    className={selectedPacking === packing ? 'selected' : ''}
                    onClick={() => handlePackingSelect(packing)}
                  >
                    {packing}
                  </button>
                ))}
              </div>
            </div>
            <div className="salt-info">
              <h2>{result.salt}</h2>
              {selectedSalt &&
              selectedSalt.salt === result.salt &&
              selectedForm &&
              selectedStrength &&
              selectedPacking ? (
                getLowestPrice() !== null ? (
                  <p>From ₹{getLowestPrice()}</p>
                ) : (
                  <p>No stores selling this product near you</p>
                )
              ) : (
                <p>Select form, strength, and packing to see the price.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
