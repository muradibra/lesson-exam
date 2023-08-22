import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Input, Row } from 'reactstrap';
import { apiUrl, toast_config } from './config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { nanoid } from 'nanoid';

function App() {
  const [countryList, setCountryList] = useState([])
  const [cityList, setCityList] = useState([])

  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)

  const [addCountry, setAddCountry] = useState("")
  const [addCity, setAddCity] = useState("")

  const [searchData, setSearchData] = useState("")
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    axios.get(`${apiUrl}/countries`)
      .then(res => setCountryList(res.data))
  }, [])

  useEffect(() => {
    searchDatabase()
  }, [searchData])

  // useEffect(() => {
  // showMatchingCities()
  // }, [selectedCountry])

  function addCountryToData() {
    const existCountry = countryList.find(item => item.name.toLowerCase() === addCountry.toLowerCase())

    if (!addCountry) {
      toast.error("This field is required", toast_config)
      return
    }
    if (existCountry) {
      toast.error("This country exists in the database!", toast_config)
      return
    }

    axios.post(`${apiUrl}/countries`, { name: addCountry })
      .then(res => {
        console.log(res.data)
        setCountryList(prevState => [...prevState, res.data])
        setAddCountry("")
        toast.success("Country successfully added!")
      })
  }

  function addCityToData() {
    const existCity = cityList.find(item => item.name.toLowerCase() === addCity.toLowerCase())

    if (!addCity) {
      toast.error("This field is required!", toast_config)
      return
    }
    if (existCity) {
      toast.error("This city exists in the database!", toast_config)
      return
    }

    axios.post(`${apiUrl}/cities`, {
      name: addCity,
      country_id: selectedCountry.id
    }).then(res => {
      setCityList(prevState => [...prevState, res.data])
      setAddCity("")
      toast.success("City successfully added!", toast_config)
    })
  }

  function showMatchingCities(country) {
    if (country) {
      axios.get(`${apiUrl}/cities?country_id=${country?.id}`)
        .then(res => setCityList(res.data))
    } else {
      setCityList([])
    }
  }

  function searchDatabase() {
    if (!searchData) {
      setSearchResults([])
      return
    } else {
      axios.get(`${apiUrl}/countries?q=${searchData}`)
        .then(res => {
          const countries = res.data.map(country => ({ ...country, type: 'country' }))
          return countries
        })
        .catch(err => {
          console.log("Country Search Error: ", err)
          return []
        })
        .then(countries => {
          axios.get(`${apiUrl}/cities?q=${searchData}`)
            .then(res => {
              const cities = res.data.map(city => ({ ...city, type: 'city' }))
              setSearchResults([...countries, ...cities])
            })
            .catch(err => {
              console.log("City Search Error: ", err);
              setSearchResults(countries);
            })
        })
    }
  }

  return (
    <Container>

      <div className='mt-5'>
        <Row>
          <div className='col-8 col-md-6'>
            <div className='mb-3'>
              <label htmlFor="addCountry" className='d-block'>Add a country</label>
              <input
                type="text"
                id='addCountry'
                value={addCountry}
                onChange={(e) => setAddCountry(e.target.value)}
              />
              <button
                type='button'
                className='btn btn-primary ms-3'
                onClick={() => addCountryToData()}
              >
                Add Country
              </button>
            </div>

            <div className='mb-5 w-50'>
              <Select
                name="country"
                isClearable
                isSearchable
                options={countryList}
                value={selectedCountry}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.name}
                onChange={(e) => {
                  setSelectedCountry(e)
                  showMatchingCities(e)
                }}
              />
            </div>
          </div>

          <div className='col-8 col-md-6 mb-3'>
            {/* <div className='mb-3'> */}
            {
              selectedCountry &&
              <div className='mb-3'>
                <label htmlFor="addCity" className='d-block'>Add a city</label>
                <input
                  type="text"
                  id='addCity'
                  value={addCity}
                  onChange={(e) => setAddCity(e.target.value)}
                />
                <button
                  className='btn btn-primary ms-3 '
                  onClick={() => addCityToData()}
                >
                  Add a city
                </button>
              </div>
            }

            {/* </div> */}
            <div className='w-50'>
              <Select
                name="city"
                isClearable
                isSearchable
                options={cityList}
                value={selectedCity}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.name}
                onChange={(e) => setSelectedCity(e)}
              />
            </div>
          </div>
        </Row>

        <div>
          <label className='d-block mb-2' htmlFor="searchData">Search the Database</label>
          <Input
            type="text"
            id='searchData'
            className='w-50 border border-primary'
            value={searchData}
            onChange={(e) => {
              setSearchData(e.target.value)
              searchDatabase()
            }}
          />
        </div>

        {
          searchResults.length > 0 &&
          <div className='mt-3'>
            <h4>Search results:</h4>
            <ul>
              {
                searchResults.map(result => (
                  <li key={nanoid()}>
                    {
                      result.type == "city" ? `City: ${result.name}` : `Country: ${result.name}`
                    }
                  </li>
                ))
              }
            </ul>
          </div>
        }
      </div>
      <ToastContainer />
    </Container>

  )
}

export default App