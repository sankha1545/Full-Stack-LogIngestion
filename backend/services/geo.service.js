const axios = require("axios");

exports.getCountries = async () => {
  const { data } = await axios.get("https://restcountries.com/v3.1/all");

  return data.map((c) => ({
    name: c.name.common,
    code: c.cca2,
    dialCode:
      c.idd?.root && c.idd?.suffixes?.length
        ? c.idd.root + c.idd.suffixes[0]
        : "",
  }));
};

exports.getStatesByCountry = async (countryCode) => {
  // Example using countriesnow API
  const { data } = await axios.post(
    "https://countriesnow.space/api/v0.1/countries/states",
    { iso2: countryCode }
  );

  return data.data.states.map((s) => s.name);
};
