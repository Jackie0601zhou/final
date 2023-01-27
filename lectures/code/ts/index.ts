const add = (a: number, b: number): number => {
    let c = a + b
    return c
}

let myArr: number[] = [1,5,123141, 4.555]
let myArr2: Array<number> = [5, 6, 7]

type User = {
    name: string; 
    id: number;
    age?: number;
}

let myObj: User = 
    {name: "Vlad", id: 2}

let myObj2: User = 
    {name: "Vlad", id: 2, age: 100}

let allUsers: User[] = [
    {name: "Vlad", id: 2},
    {name: "Bob", id: 3, age: 100},
    {name: "Mary", age: 15, id: 4}
]

let s = "Robert"
let objName = {name: "Robert"}

type Name = string | {name: string}

const getName = (arg: Name): string => {
    if (typeof arg === 'string'){
        return arg
    } 
    return arg.name
}

document.getElementById("intro")!.textContent = 
    `Hello, ${getName(objName)}!`










let myArr3 = [1,5,123141, 4.555, "hello", true] 

type NumberOrString = number | string | boolean

let myArr4: Array<NumberOrString> = [1, 3, "a", "b", true]

function getLength(obj: string | string[]): number {
    return obj.length;
}

let content: number =  getLength(["1", "2", "3"])

// document.getElementById("intro")!.textContent = 
//    `${content}`

