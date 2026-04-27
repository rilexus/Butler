import ElectronStore from "electron-store";

const store = new ElectronStore({
  defaults: {
    apiKey: "",
    conversations: [],
    settings: {
      theme: "light",
    },
  },
});

export default store;
