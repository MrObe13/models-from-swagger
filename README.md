# models-from-swagger
This is a package to generate .js or .ts files that contains classes based on the JSON Swagger file (_ecma 6 is necessary_). 
You can use a JSON file saved on your machine or use a link to download and generate your models.

---

---

## Installation

Using [npm](https://www.npmjs.org/):

We suggest to install this package globally to using it in all yuor projects

```bash
  $ npm install -g models-from-swagger
```

To install in your local project

```bash
  $ npm install models-from-swagger
```

••••••••••••••••••••••••••••••••••

## How to use

For use correctly this package you must pass at least two argument: an input (inputhPath or inputUrl) & an output at create-models command. 

#### Example:
```bash
 $ create-models -u https://generator.swagger.io/api/swagger.json -o ./models
```

Script generate a new folder named as the last string of the output parameter. 
Into this folder, generate two type of files: baseModel and Model. 

- models 🗂
    - baseModels 🗂
      - BaseJack 📃
      - BaseSusy 📃
      - BaseLarry 📃
      - BaseBob 📃
    - Jack 📃
    - Susy 📃
    - Larry 📃
    - Bob 📃
    
In baseModels are put every model from swagger with property and imports of dependencies. **_This folder is deleted and rewritten_ every time that script is used**. 
When you need to edit, extend or create a parameter of the object, use the models that extend baseModel. The changes will not be deleted or overwritten


#### Commands list:
```bash
Options:
  -V, --version            output the version number
  -i, --inputPath <path>   Add input path from where the file will be read (default: []) 
  -u, --inputUrl <url>     Add input url (default: [])
  -o, --outputPath <path>  Add output path where write final js file
  -t, --type <type>        Choose format type between .js or .ts  (default: ".js")
  -h, --help               output usage information
```

- -i, --inputPath 

Insert path where your file it's located. Relative path is based on root of your project
```bash
  $ create-models -i ./genericFolder/swagger.json -o ./models
```
- -u, --inputUrl

Insert url to download file from remote endpoint. The inserted url must be url where json swagger file is expose (*see [swagger](https://swagger.io/) to more info*)
```bash
  $ create-models -u https://generator.swagger.io/api/swagger.json -o ./models
```
- -t, --type

You can to generate a basic .js file. If you use Typescript in yuor project, add .ts at the end of command to generate files with specific sintax for it.
```bash
  $ create-models -u https://generator.swagger.io/api/swagger.json -o ./models -t .ts
```

---

## Output example

- BaseBob.js
```javascript
import Programmer from '../Programmer';

export default class BaseBob {
  static attrTypes = {
    age: {
      'type': 'integer',
      'format': 'int64',
      'description': 'Age of Bob',
      'required': true
    },
    family: {
      'type': 'array',
      'itemType': 'string'
    },
    Job: {
      'type': Programmer
    },
  };
}
```
- Bob.js
```javascript
import BaseDayInfo from './baseModel/BaseBob';

export default class Bob extends BaseBob {

  // static idAttribute = 'id';
  // static subClasses = {};
  // static discriminator = null;
}
```
