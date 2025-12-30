const app = require("../src/app");

// Vercel serverless handler
module.exports = (req, res) => app(req, res);
