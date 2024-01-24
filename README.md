# LupaJS

Quickly make a simple search engine based on a Google Sheet or JSON data.

## How To Use LupaJS with Google Sheets

### Standard Column Headers

You will need a Google Sheet that has the following column headers listed (case-insensitive) in the first row:
- Title
- URL

Optionally you can have the following two columns (case-insensitive):
- Description
- Keywords

### Publish to the Web

Once you have created a Google Sheet with the aforementioned columns and you have put data in it you will then need to publish the sheet to the web.  You can accomplish this by doing the following:

1. Go to `File` > `Share` > `Publish to web`
1. In the `Publish to the web` modal do the following:

    1. Select the sheet which contains the search engine records.
        ![](/README-images/publish%20to%20the%20web%20-%20select%20sheet.png)

    1. Click the green `Publish` button.
        ![](/README-images/publish%20to%20the%20web%20-%20green%20publish%20button.png)

    1. Confirm that you want to publish the selected sheet to the web.
        ![](/README-images/prompt%20-%20confirm%20publishing%20sheet.png)

    1. Copy the produced URL corresponding to your newly published sheet.
        ![](/README-images/publish%20to%20the%20web%20-%20copy%20url%20of%20sheet.png)

## Continued Development of LupaJS

### Set Up for Development

Install of the development dependencies by running `npm install`.

### Generate Dist Files

Execute `npm start` to run gulp and then edit one of the three files in `src/`.
