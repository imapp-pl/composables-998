module.exports = {
    compilers: {
        solc: {
            version: "^0.4.21",
            settings: {
                optimizer: {
                    // disabled by default
                    enabled: true,
                    // Optimize for how many times you intend to run the code.
                    // Lower values will optimize more for initial deployment cost, higher
                    // values will optimize more for high-frequency usage.
                    runs: 200
                }
            }
        }
    }

  /*
    networks: {
        development: {
          host: "127.0.0.1",
          port: 9545,
          gas: 8000000,
          network_id: "*" // Match any network id

        }
      }
      */
};