/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily:{
				"poppins":["Poppins","serif"],
				"bai":["Bai Jamjuree","serif"],
				"Jost":["Jost","serif"],
				"Lato":["Lato","sans-serif"],
				"Anek":["Anek Bangla","sans-serif"]
			  },
		},
	},
	plugins: [],
};
