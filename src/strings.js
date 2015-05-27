
/////////////////////////////////////////////////////////////
// TODO map a type into an object with values according to a given type -> mapping function

// I need to walk this better, somehow
// handle the maybes etc?
// yeah, because the validators are going to need to know how to look them up too!
//function toStrings(key: Identifier, anno: TypeAnnotation):ObjectMap<string> {
  //var anno = prop.value
  //var key = prop.key.name
  //var obj = {}
  //var value = "unknown"

  //if (prop.optional) {
    //key = "?"+key
  //}

  //if (anno.type == "StringTypeAnnotation") {
    //value = "string"
  //}

  //else if (anno.type == "NumberTypeAnnotation") {
    //value = "number"
  //}

  //else if (anno.type == "NullableTypeAnnotation") {
    //var nanno:WrapperTypeAnnotation = (anno : any)
    //value = "?"+toValueString(nanno.typeAnnotation)
  //}

  //else if (anno.type == "GenericTypeAnnotation") {
    //var g:GenericTypeAnnotation = (anno : any)
    //value = g.id.name
    //if (g.typeParameters) {
      //var params:Array<TypeAnnotation> = g.typeParameters.params
      //var inner = params.map(toValueString)
      //value += "<" + inner.join(", ") + ">"
    //}
  //}

  //else {
    //throw new Error("No mapping for " + JSON.stringify(anno))
  //}

  //obj[key] = value
  //return obj
//}

// no, really you want to just map them. then you can use _.assign to get them to be one object

//function map<T>(toValue:(t:TypeProperty) => T, anno: ObjectTypeAnnotation):Array<T> {
  //return anno.properties.map(function(map, prop:TypeProperty) {
    //return toValue(prop)
    ////var anno = prop.value

    ////console.log("PROP", prop)
    ////// TODO handle prop.optional

    ////if (anno.type == "ObjectTypeAnnotation") {
      ////var value = mapToObject(a => toValue(a), (anno:any))
    ////}

    ////else {
      ////var value = toValue(anno)
    ////}

    ////map[key] = value
    ////return map
  //}, {})
//}

//var mapToStrings = mapToObject(toValueString)

/////////////////////////////////////////////////////////////
