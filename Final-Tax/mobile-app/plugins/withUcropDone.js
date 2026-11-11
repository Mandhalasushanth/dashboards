const { withStringsXml } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to override native Android UCrop confirmation button text
 * from "Crop" to "Done".
 */
const withUcropDone = (config) => {
  return withStringsXml(config, (config) => {
    config.modResults.resources.string = config.modResults.resources.string || [];

    const stringKeysToOverride = ["crop_image_menu_crop", "ucrop_menu_crop"];

    // Filter out existing entries if present
    config.modResults.resources.string = config.modResults.resources.string.filter(
      (item) => item && item.$ && !stringKeysToOverride.includes(item.$.name)
    );

    // Append our custom Done text for all cropper libraries purely functionally
    const customDoneEntries = stringKeysToOverride.map((key) => ({
      $: { name: key },
      _: "Done",
    }));

    config.modResults.resources.string = [
      ...config.modResults.resources.string,
      ...customDoneEntries,
    ];

    return config;
  });
};

module.exports = withUcropDone;
