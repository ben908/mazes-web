
import { resolveConfig } from "vite";

const {resolve} = require("path")

export default {

    build: {
        chunkSizeWarningLimit: 1000,

        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            }
        }
    }

}