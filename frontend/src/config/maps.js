// Maps configuration using environment variables
export const MAPS_CONFIG = {
    BING_MAPS_API_KEY: import.meta.env.VITE_BING_MAPS_API_KEY,
    EMBED_BASE_URL: "https://www.bing.com/maps/embed",
    DEFAULT_ZOOM: 15,
    MAP_HEIGHT: 300,
    MAP_WIDTH: 400,
    MAP_STYLE: "r", 
    MAP_TYPE: "d" 
};


export const generateBingMapsUrl = (lat, lng, options = {}) => {
    const {
        zoom = MAPS_CONFIG.DEFAULT_ZOOM,
        style = MAPS_CONFIG.MAP_STYLE,
        type = MAPS_CONFIG.MAP_TYPE,
        height = MAPS_CONFIG.MAP_HEIGHT,
        width = MAPS_CONFIG.MAP_WIDTH
    } = options;

    return `${MAPS_CONFIG.EMBED_BASE_URL}?h=${height}&w=${width}&cp=${lat}~${lng}&lvl=${zoom}&typ=${type}&sty=${style}&src=SHELL&FORM=MBEDV8&key=${MAPS_CONFIG.BING_MAPS_API_KEY}`;
};


export const validateMapsConfig = () => {
    if (!MAPS_CONFIG.BING_MAPS_API_KEY) {
        console.error('Bing Maps API key is missing. Please check your environment variables.');
        return false;
    }
    return true;
};