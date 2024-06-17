/*Importar a biblioteca Papa Parse
import Papa from 'papaparse';*/

//Aqui eu to lendo linha por linha do arquivo .csv
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configurações para obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Importar o Fastify
import Fastify from 'fastify';
const filepath = 'weather_stations.csv';

//Inicializando o Fastify
const fastify = Fastify({ logger: true });


let rodando_servidor = "http://127.0.0.1:3000";
let msg = ' Servidor rodando na url: ' + rodando_servidor+'\nResultados das estações:';

// Rota principal para retornar informações diversas
fastify.get('/', async (request, reply) => {
  const filePath = path.join(__dirname, "../data/measurements.txt");


  // Variáveis para armazenar a estação com a temperatura mais baixa e mais alta
  let stationWithLowestTemp = '';
  let lowestTemperature = Infinity; 
  let stationWithHighestTemp = '';
  let highestTemperature = -Infinity; 

  // Objeto para armazenar a frequência das estações
  const stationFrequency = {};

  // Variáveis para calcular a média das temperaturas
  let totalTemperatures = 0;
  let countTemperatures = 0;

  const lineReader = readline.createInterface({
    input: fs.createReadStream(filePath)
  });

  lineReader.on('line', (line) => {
    const [station, tempStr] = line.split(';');
    const temperature = parseFloat(tempStr.replace('-', ''));

    // Verifica e atualiza a temperatura mais baixa
    if (temperature < lowestTemperature) {
      lowestTemperature = temperature;
      stationWithLowestTemp = station;
    }

    // Verifica e atualiza a temperatura mais alta
    if (temperature > highestTemperature) {
      highestTemperature = temperature;
      stationWithHighestTemp = station;
    }

    // Atualiza a frequência da estação
    if (stationFrequency[station]) {
      stationFrequency[station]++;
    } else {
      stationFrequency[station] = 1;
    }

    // Calcula a média das temperaturas
    totalTemperatures += temperature;
    countTemperatures++;
  });

  return new Promise((resolve, reject) => {
    lineReader.on('close', () => {
      let mostFrequentStation;
      let maxFrequency = 0;

      // Encontra a estação com maior frequência de ocorrências
      for (const station in stationFrequency) {
        if (stationFrequency[station] > maxFrequency) {
          mostFrequentStation = station;
          maxFrequency = stationFrequency[station];
        }
      }

      // Calcula a média das temperaturas
      const averageTemperature = countTemperatures > 0 ? totalTemperatures / countTemperatures : 0;

      const result = {
        message: 'Informações diversas:',
        stationWithLowestTemp: {
          station: stationWithLowestTemp,
          temperature: lowestTemperature
        },
        stationWithHighestTemp: {
          station: stationWithHighestTemp,
          temperature: highestTemperature
        },
        mostFrequentStation: {
          station: mostFrequentStation,
          frequency: maxFrequency
        },
        // Arredondamento para 2 casas decimais
        averageTemperature: averageTemperature.toFixed(2) 
      };

      resolve(result);
    });

    lineReader.on('error', (err) => {
      fastify.log.error(`Erro ao ler arquivo:`, err);
      reject(err);
    });
  });
});




//Criando rota /station/{{nome}}

fastify.get("/station/:nome", async function handler(request, reply) {
  const stationName = request.params.nome;
  const filePath = path.join(__dirname, "../data/measurements.txt");

  const lines = [];

  const lineReader = readline.createInterface({
    input: fs.createReadStream(filePath)
  });

  lineReader.on('line', (line) => {
    // Adicione um log para ver as linhas sendo lidas do arquivo
    
    if (line.includes(stationName)) {
      lines.push(line);
    }
  });

  return new Promise((resolve, reject) => {
    lineReader.on('close', () => {
      // Ordena as linhas filtradas em ordem alfabética
      lines.sort(); 

      // Envia os dados lidos como resposta
      resolve(lines); 
    });

    lineReader.on('error', (err) => {
      fastify.log.error(`Erro ao ler arquivo:`, err);
      reject(err);
    });
  });
});
     
     /* 
     [INVÉS DE USAR O PAPA PARSE É MAIS EFICIENTE USAR O READLINE (PEFORMÁTICO)]
     Analisar o conteúdo do arquivo CSV
     Papa.parse('weather_stations.csv', {
          complete: function(results) {
              console.log(results.data);
          }
      });
      */



//Criando rota /temperatura/{{temperatura}}

fastify.get("/temperatura/:temperatura", async function handler (request,reply){
  
  const temperature = parseFloat(request.params.temperatura);

  //Aqui obten-se o caminho do arquivo de tais medições feitas
  const filePath = path.join(__dirname, "../data/measurements.txt");

  const stationsSet = new Set();

  const lineReader = readline.createInterface({

    input: fs.createReadStream(filePath)

  });


  return new Promise((resolve,reject) =>{

    lineReader.on('line', (line) =>{
      const [station,temp] = line.split(';');
      const tempValue = parseFloat(temp.replace('-',''));


      if((line.includes('-') && -tempValue <= temperature && temperature <= tempValue) ||
      (!line.includes('-') && tempValue <= temperature)){

        stationsSet.add(station);



      }

    });

    lineReader.on('close', () => {

      resolve(Array.from(stationsSet));


    });

    lineReader.on('error',(err) => {
      reject(err);
    });



  });



});



//Inicializando o servidor
try {
     await fastify.listen({ port: 3000 });
} catch (err) {
     fastify.log.error(err);
     process.exit(1);
}