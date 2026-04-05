//Saludar a una persona

function saludar ( nombre : string):string {
    return "hola " + nombre ; 

}

console.log (saludar("mundo") ) ;

// sumar dos numeros 

function sumar ( n1: number , n2: number):number{
    let suma: number = n1+n2 ; 

    return suma ; 

    
}
console.log ( sumar ( 4,3) ) ; 

// saber si un numero es par 

function esPar ( n:number):boolean {
    if( n %2===0 ){
        return true ; 
    }
  return false ; 
}
console.log ( esPar ( 4) ) ; 

// saber si es mayor de edad 

function esMayorDeEdad ( n: number) : boolean {
    if( n>=18 ){
        return true ; 
    }
    return false ; 

}
console.log ( esMayorDeEdad ( 4) ) ;

//recorrer un arreglo 

const arreglo: number [] = [1,2,3,4,5] ;

for ( let i = 0 ; i < arreglo.length; i++ ){
    console.log(arreglo[i]) ;
}

//sumar todos los numeros de un arreglo 

function Sumararreglo ( n: number[] ) : number {
    let suma:number= 0 ; 
    for ( let i = 0 ; i < n.length; i++ ){
        suma += n[i] ;
    }
     return suma ; 

}

console.log( "la suma es " + Sumararreglo([2,3,4]) );

function encontrarMayor (n: number [] ) : number {
    let mayor: number = n[0] ; 
    for ( let i = 1; i < n.length; i++ ){
        if ( n[i]> mayor){
            mayor = n[i];
        }
      
    }
      return mayor ;
}
console.log ( "el mayor es " + encontrarMayor([2,3,4]) ) ;


function ContarVocales ( n:string): number {
    let contador : number = 0 ; 
    const vocales = "aeiouAEIOU" ;
    for ( let i = 0 ; i<n.length; i++ ) {
        if (vocales.includes(n[i]) ){
            contador++  ; 
    }

}
return contador  ; 
}
console.log ( "el numero de vocales es " + ContarVocales("hola mundo") ) ;

//creacion de  pokemon 

type Pokemon = {
     nombre : string ; 
     tipo : string  ; 
     nivel : number ; 
}

const pokemon: Pokemon [] = [
    { nombre: "Pikachu", tipo: "Eléctrico", nivel: 25 },
    { nombre: "Charmander", tipo: "Fuego", nivel: 15 },
    { nombre: "Squirtle", tipo: "Agua", nivel: 20 }
] ; 

function mostrarPokemon ( poke:Pokemon) : string{
    return `${poke.nombre} es un pokemon de tipo ${poke.tipo} y nivel ${poke.nivel}`;
}
console.log ( "tenemos el pokemon " + mostrarPokemon(pokemon[0]) + " y " + mostrarPokemon(pokemon[1]) + " y " + mostrarPokemon(pokemon[2]) ) ;

// Listar usuarios

type Usuario = {
    nombre: string ; 
    edad: number ; 
    dni: string ; 
}

const usuario:Usuario [] =  [
    { nombre:'Diego',edad:23,dni:'71323495'},
    {nombre:'Rolando',edad:64,dni:'08151541',},
    {nombre:'Luisa',edad:54,dni:'09232322'}
]

for ( let i = 0 ; i < usuario.length; i++){
 console.log (`en el sistema tenemos ${i+1} de nombre ${usuario[i].nombre}, edad ${usuario[i].edad} y dni: ${usuario[i].dni}`)
}

console.log("------------------------------")
