import Handlebars from 'handlebars';

/**
 * Function to initialize utility for Handlebars model
 */
export default function handlebarsFunc() {
  Handlebars.registerHelper({
    eq(v1, v2) {
      return v1 === v2;
    },
    ne(v1, v2) {
      return v1 !== v2;
    },
    and(v1, v2) {
      return v1 && v2;
    },
    or(v1, v2) {
      return v1 || v2;
    },
  });

  Handlebars.registerHelper('splitPath', (input) => {
    const output = input.split('/').pop();
    return output;
  });

  Handlebars.registerHelper('stringfyObj', (input) => {
    const stringInput = JSON.stringify(input, null, 2);
    const stringElab = stringInput.replace(/"\$(\w*)\$"/g, '$1');
    const jsFile = stringElab.replace(/"/g, "'");
    return new Handlebars.SafeString(jsFile);
  });
}
