function find_all_classes_by_day(routine, allowed_courses){
  let all_classes = []
  for (const [key, value] of Object.entries(routine)){
    all_classes.push({"day": key, classes: find_class_day(routine, key, allowed_courses)})
  }
  return all_classes
}
function find_class_day(routine, day_value, allowed_courses){	
  let keys = []
	let result_arr = []
	for (const [key, value] of Object.entries(routine[day_value])){
  	if(routine[day_value][key]){
      keys.push(key)
  	}
	}
  keys.forEach(key => {
    routine[day_value][key].forEach(item=>{
      if(allowed_courses.includes(item.course_code)){
        result_arr.push({"time": key, "class": item})
      }
    })
  })
  return result_arr
}

module.exports = find_all_classes_by_day