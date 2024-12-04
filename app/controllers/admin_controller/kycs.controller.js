const db = require("../../models");
const Country = db.countries;
const KYC = db.kycs;
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

exports.addCountryWithKYC = async (req, res) => {
  try {
    const { country_name, kycs } = req.body;

    // Validate input
    if (!country_name || !Array.isArray(kycs) || kycs.length === 0) {
      RESPONSE.Failure.Message = "Country name and KYC details are required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Check if the country already exists
    const existingCountry = await Country.findOne({
      where: { country_name },
    });

    if (existingCountry) {
      RESPONSE.Failure.Message = "Country already exists.";
      return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
    }

    // Create the country with associated KYC details
    const newCountry = await Country.create(
      {
        country_name,
        kycs: kycs.map((kyc_name) => ({ kyc_name })),
      },
      { include: [{ model: KYC, as: "kycs" }] } // Include KYC association
    );

    RESPONSE.Success.Message = "Country and KYC details added successfully.";
    RESPONSE.Success.data = newCountry;
    return res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("addCountryWithKYC:", error);
    RESPONSE.Failure.Message =
      error.message || "Error adding country with KYC.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getKYCByCountry = async (req, res) => {
  try {
    const { country_name } = req.params;

    // Validate input
    if (!country_name) {
      RESPONSE.Failure.Message = "Country name is required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Find the country with associated KYC details
    const country = await Country.findOne({
      where: { country_name },
      include: [
        {
          model: KYC,
          as: "kycs",
          attributes: ["kyc_name"], // Include only KYC names
        },
      ],
    });

    if (!country) {
      RESPONSE.Failure.Message = "Country not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "KYC details fetched successfully.";
    RESPONSE.Success.data = {
      country_name: country.country_name,
      kycs: country.kycs.map((kyc) => kyc.kyc_name), // Return KYC names as an array
    };
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getKYCByCountry:", error);
    RESPONSE.Failure.Message =
      error.message || "Error fetching KYC details by country.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


// Add more KYCs to an existing country
// exports.addKYCToExistingCountry = async (req, res) => {
//     try {
//       const { country_name, kycs } = req.body;
  
//       // Validate required fields
//       if (!country_name || !Array.isArray(kycs) || kycs.length === 0) {
//         return res.status(StatusCode.BAD_REQUEST.code).send({
//           ...RESPONSE.Failure,
//           Message: "Invalid input. Please provide a valid country_name and kycs array.",
//         });
//       }
  
//       // Find the country by name
//       const country = await Country.findOne({ where: { country_name } });
  
//       if (!country) {
//         return res.status(StatusCode.NOT_FOUND.code).send({
//           ...RESPONSE.Failure,
//           Message: "Country not found. Please ensure the country exists.",
//         });
//       }
  
//       // Add new KYCs to the database
//       const newKYCs = kycs.map((kyc) => ({
//         country_id: country.country_id,
//         kyc_name: kyc,
//       }));
  
//       // Bulk create KYCs (ignore duplicates based on unique constraints)
//       await KYC.bulkCreate(newKYCs, { ignoreDuplicates: true });
  
//       RESPONSE.Success.Message = "KYCs added successfully to the existing country.";
//       RESPONSE.Success.data = newKYCs;
//       res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     } catch (error) {
//       console.error("addKYCToExistingCountry:", error);
//       RESPONSE.Failure.Message = error.message || "Error adding KYCs to the country.";
//       res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//     }
//   };
  
// Add more KYCs to an existing country (prevents duplicates)
exports.addKYCToExistingCountry = async (req, res) => {
    try {
      const { country_name, kycs } = req.body;
  
      // Validate required fields
      if (!country_name || !Array.isArray(kycs) || kycs.length === 0) {
        return res.status(StatusCode.BAD_REQUEST.code).send({
          ...RESPONSE.Failure,
          Message: "Invalid input. Please provide a valid country_name and kycs array.",
        });
      }
  
      // Find the country by name
      const country = await Country.findOne({ where: { country_name } });
  
      if (!country) {
        return res.status(StatusCode.NOT_FOUND.code).send({
          ...RESPONSE.Failure,
          Message: "Country not found. Please ensure the country exists.",
        });
      }
  
      // Check if the KYC already exists for the country
      const existingKYCs = await KYC.findAll({
        where: { country_id: country.country_id },
        attributes: ["kyc_name"], // Only get kyc_name
      });
  
      // Create a set of existing KYCs for quick lookup
      const existingKYCNames = new Set(existingKYCs.map(kyc => kyc.kyc_name.toLowerCase()));
  
      // Filter out KYCs that already exist for the country
      const newKYCs = kycs.filter(kyc => !existingKYCNames.has(kyc.toLowerCase()));
  
      // If no new KYCs to add
      if (newKYCs.length === 0) {
        return res.status(StatusCode.BAD_REQUEST.code).send({
          ...RESPONSE.Failure,
          Message: "All provided KYCs already exist for this country.",
        });
      }
  
      // Add new KYCs to the database
      const kycsToAdd = newKYCs.map((kyc) => ({
        country_id: country.country_id,
        kyc_name: kyc,
      }));
  
      // Bulk create KYCs (ignore duplicates based on unique constraints)
      await KYC.bulkCreate(kycsToAdd, { ignoreDuplicates: true });
  
      RESPONSE.Success.Message = "KYCs added successfully to the existing country.";
      RESPONSE.Success.data = kycsToAdd;
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } catch (error) {
      console.error("addKYCToExistingCountry:", error);
      RESPONSE.Failure.Message = error.message || "Error adding KYCs to the country.";
      res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    }
  };
  