const jobRoutes = require("./job.route");
const cityRoutes = require("./city.route");
const companyRoutes = require("./company.route");
const tagRoutes = require("./tag.route");
const cvRoutes = require("./cv.route");
const userRoutes = require("./user.route");

module.exports = (app) => {
    const version = "/api/v1";
    
    app.use(version + "/jobs", jobRoutes);
    app.use(version + "/city", cityRoutes);
    app.use(version + "/companys", companyRoutes);
    app.use(version + "/tags", tagRoutes);
    app.use(version + "/cv", cvRoutes);
    app.use(version + "/users", userRoutes);
}