import fs from 'fs'

const currentDir = process.cwd()

const file = fs.readFileSync(`${currentDir}/data/weather_stations.csv`, 'utf8')

/** @type {string[]} */
const stations = file.split('\n').map((line) => {
     console.log(line)
     return line.split(';')[0]
})

/** @type {string[]} */
const measurements = []

for (let i = 0; i < stations.length; i++) {
     const station = stations[i]
     if (!station) continue

     const measurementAmount = Math.floor(Math.random() * 40)
     for (let i = 0; i < measurementAmount; i++) {
          const temperature =
               (Math.random() * 40).toFixed(2) + Math.random().toFixed(2)
          const isNegative = Math.random() > 0.8
          measurements.push(`${station};${isNegative ? '-' : ''}${temperature}`)
     }
}

const len = measurements.length
/** @type {string[]} */
let finalMeasurements = []
for (let i = 0; i < len; i++) {
     const randomIndex = Math.floor(Math.random() * len)

     finalMeasurements.push(`${measurements[randomIndex]}`)
}
fs.writeFileSync(
     `${currentDir}/data/measurements.txt`,
     finalMeasurements.join('\n')
)

