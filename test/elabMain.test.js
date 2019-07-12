const processFunc = require('../lib/processFunc');

const itemsArrayEnum = {
  type: 'array',
  items: {
    type: 'string',
    enum: [
      'enum1',
      'enum2',
      'enum3',
      'enum4',
      'enum5',
    ],
  },
};


test('ElaborateArray Item with Enum', () => {
  expect(itemsArrayEnum).toBeDefined();
  expect(processFunc.transformArrayItem(itemsArrayEnum.items, itemsArrayEnum)).toEqual({
    type: 'array',
    itemType: {
      type: 'string',
      enum: ['enum1',
        'enum2',
        'enum3',
        'enum4',
        'enum5'],
    },
  });
});

// ///////////////////////// MAP /////////////////////////////

const mapJson = {
  type: 'object',
  additionalProperties: {
    $ref: '#/definitions/ParamObjectType',
  },
};

test('ElaborateObject Item with from map', () => {
  expect(mapJson).toBeDefined();
  expect(processFunc.transformObjItem(mapJson.additionalProperties, mapJson)).toEqual({
    type: 'object',
    itemType: '$ParamObjectType$',
  });
});


// ///////////////////////// ARRAY OF ARRAY /////////////////////////////

const arrayOfArray = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'object',
    },
  },
};

test('ElaborateObject Array of Arrays', () => {
  expect(arrayOfArray).toBeDefined();
  expect(processFunc.transformArrayItem(arrayOfArray.items, arrayOfArray)).toEqual({
    type: 'array',
    itemType: {
      type: 'array',
      itemType: {
        type: 'object',
      },
    },
  });
});


// ///////////////////////// REF /////////////////////////////


const itemsArrayRef = {
  type: 'array',
  items: {
    $ref: '#/definitions/SpecificArray',
  },
};

test('ElaborateArray Item With $Ref', () => {
  expect(itemsArrayRef).toBeDefined();
  expect(processFunc.transformArrayItem(itemsArrayRef.items, itemsArrayRef)).toEqual({
    type: 'array',
    itemType: '$SpecificArray$',
  });
});


const objRef = {
  $ref: '#/definitions/SpecificObjectRef',
};

test('Elaborate Obj With $Ref', () => {
  expect(processFunc.transformRef(objRef)).toEqual({ type: '$SpecificObjectRef$' });
});
