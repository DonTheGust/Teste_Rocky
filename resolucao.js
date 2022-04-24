//Importação do JSON através da readFileSync, método implementado pelo próprio Node
const fs = require("fs");
var jsonData = fs.readFileSync("./broken-database.json", "utf8");

//Conversão do JSON para um objeto permitindo assim as modificações do mesmo dentro do escopo do nosso projeto
jsonData = JSON.parse(jsonData);

//Função para correção dos caracteres corrompidos no campo name de cada objeto dentro do array
function converterNome(arr) {
    let str = arr['name'];
    str = str.replace(/æ/gi, 'a');
    str = str.replace(/¢/gi, 'c');
    str = str.replace(/ø/gi, 'o');
    str = str.replace(/ß/gi, 'b');
    arr['name'] = str;
}

//Função para casting dos preços corrompidos no campo price de string para um número de ponto flutuante (decimal)
function validarPreco(arr) {
    arr['price'] = parseFloat(arr['price']);
};

//Função para preenchimento e criação dos campos quantidade que estão faltantes em alguns objetos do array
function preencherQuantidade(arr) {
    if (arr['quantity'] == undefined) {
        arr['quantity'] = 0;
    }
};

//Laço iterativo para execução das correções em todos os objetos importados do JSON
for (var x = 0; x < jsonData.length; x++) {
    converterNome(jsonData[x]);
    validarPreco(jsonData[x]);
    preencherQuantidade(jsonData[x]);
}

//https://ricardo-reis.medium.com/o-m%C3%A9todo-sort-do-array-javascript-482576734e0a
/*Testagem 01 - Trecho retirado do site Medium e adaptado, o mesmo corrige a ordem alfabética dos
produtos por meio da função sort(), sua testagem se baseia em uma segunda função, localeCompare(), 
que compara duas strings por vez verificando se são semelhantes e retornando um valor, o toUpperCase() 
incorporado é apenas para mais acuracidade ao teste*/
jsonData.sort(function (x, y) {
    let a = x.category.toUpperCase(),
        b = y.category.toUpperCase();
    return a.localeCompare(b);
})
/*Sua adaptação ocorre aqui, onde incorporamos uma segunda testagem como critério de desempate em 
caso de produtos de mesma categoria, este if altera a posição de items com a mesma categoria 
utilizando um slice() que compara o nome das categorias, o return é uma condição ternaria que testa as 
IDs e assim como a localeCompare(), também retorna uma valor*/
jsonData.sort(function (x, y) {
    let a = x.category.toUpperCase(),
        b = y.category.toUpperCase();
    if (a.slice(0, a.length - 1) == b.slice(0, a.length - 1)) {
        a = x.id;
        b = y.id;
        return a == b ? 0 : a > b ? 1 : -1;
    }
})

console.log('\nLista de produtos por categoria em ordem alfabética e por Id crescente:')
console.log(jsonData)
//console.table(jsonData)
/*Não deixei a exibição .table como padrão pois a mesma pode parecer estranha se 
executada em uma janela de visualização pequena*/

/*Testagem 02 - Função que calcula o valor total em estoque utilizando a multiplicação do valor de 
cada produto por sua quantidade em estoque, portanto que esses tenham a mesma categoria é claro, 
categoria essa que deve ser passada como parametro da função, ao fim retorna o valor final calculado*/
function somaEstoque(arr, key) {
    let valorTotal = 0;
    for (x = 0; x < arr.length; x++) {
        if (arr[x]['category'] == key)
            valorTotal = valorTotal + (arr[x]['quantity'] * arr[x]['price']);
    }
    return valorTotal;
}

//Laço iterativo para registro de todas as categorias diferentes que temos dentro do nosso array
var categorias = [];
for (x = 0; x < jsonData.length; x++) {
    let diferente = 0;
    for (let i = 0; i < categorias.length; i++)
        if (jsonData[x]['category'] == categorias[i])
            diferente++;

    if (diferente == 0)
        categorias.push(jsonData[x]['category']);
}

//Laço iterativo para exibição em tela das somas de valor de estoque por categoria
console.log('\n\nValor total dos items em estoque por categoria:')
for (element in categorias) {
    console.log('Os produtos da categoria ' + categorias[element] + ' somam um valor total de estoque de: ' + somaEstoque(jsonData, categorias[element]).toFixed(2) + ' reais')
}

//Conversão do array de objetos trabalhado, para formato JSON novamente
var saida = JSON.stringify(jsonData)

//Exportação do JSON saida através da writeFileSync, método implementado novamente, pelo próprio Node
fs.writeFileSync('./saida.json', saida, 'utf8', function (err) {
    if (err) {
        return console.log("Erro ao salvar database");
    }
});
return console.log("\nNova database (saida.json) salva!\n");