const axios = require('axios');
async function run() {
  const query = `[out:json][timeout:25];
      (
        node["amenity"~"hospital|clinic"](around:2000,28.6139,77.2090);
        way["amenity"~"hospital|clinic"](around:2000,28.6139,77.2090);
      );
      out center 30;`;
  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter', 'data=' + encodeURIComponent(query));
    console.log(res.data.elements.length, "elements found");
    if(res.data.elements.length > 0) console.log(res.data.elements[0]);
  } catch (e) {
    console.error(e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
  }
}
run();
