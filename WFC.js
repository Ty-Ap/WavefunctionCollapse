class WaveFunctionCollapse {
  constructor(input, outputSize, patternSize) {
    this.input = input;
    this.outputSize = outputSize;
    this.patternSize = patternSize;

    this.patterns = this.generatePatterns();
    this.output = this.initializeOutput();
  }

  generatePatterns() {
    const patterns = new Map();
    const size = this.input.length;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pattern = [];

        for (let dy = 0; dy < this.patternSize; dy++) {
          for (let dx = 0; dx < this.patternSize; dx++) {
            const cy = (y + dy) % size;
            const cx = (x + dx) % size;
            pattern.push(this.input[cy][cx]);
          }
        }

        const key = pattern.join(',');

        if (patterns.has(key)) {
          patterns.set(key, patterns.get(key) + 1);
        } else {
          patterns.set(key, 1);
        }
      }
    }

    return patterns;
  }

  initializeOutput() {
    const output = [];

    for (let y = 0; y < this.outputSize; y++) {
      output[y] = [];

      for (let x = 0; x < this.outputSize; x++) {
        output[y][x] = {
          possiblePatterns: Array.from(this.patterns.keys()),
          entropy: -1,
        };
      }
    }

    return output;
  }

  calculateEntropy(outputCell) {
    let entropy = 0;

    for (const patternKey of outputCell.possiblePatterns) {
      const patternCount = this.patterns.get(patternKey);
      entropy += patternCount;
    }

    return entropy;
  }

  findLowestEntropyCell() {
    let minEntropy = Infinity;
    let minCell = null;

    for (let y = 0; y < this.outputSize; y++) {
      for (let x = 0; x < this.outputSize; x++) {
        const cell = this.output[y][x];

        if (cell.entropy < 0) {
          cell.entropy = this.calculateEntropy(cell);
        }

        if (cell.entropy < minEntropy) {
          minEntropy = cell.entropy;
          minCell = { x, y };
        }
      }
    }

    return minCell;
  }

  collapse(cell) {
    const outputCell = this.output[cell.y][cell.x];
    const weightedPatterns = [];

    for (const patternKey of outputCell.possiblePatterns) {
      const patternCount = this.patterns.get(patternKey);
      weightedPatterns.push({ key: patternKey, weight: patternCount });
    }

    const totalWeight = weightedPatterns.reduce((sum, p) => sum + p.weight, 0);
    const randomValue = Math.random() * totalWeight;
    let accumulatedWeight = 0;
    let chosenPattern = null;

    for (const weightedPattern of weightedPatterns) {
      accumulatedWeight += weightedPattern.weight;

      if (randomValue <= accumulatedWeight) {
        chosenPattern = weightedPattern.key;
        break;
      }
    }

    outputCell.possiblePatterns = [chosenPattern];
    outputCell.entropy = 0;
  }

  propagate(cell) {
    const stack = [cell];

    while (stack.length > 0) {
      const currentCell = stack.pop();
      const x = currentCell.x;
      const y = currentCell.y;
      for (let dy = -this.patternSize + 1; dy < this.patternSize; dy++) {
        for (let dx = -this.patternSize + 1; dx < this.patternSize; dx++) {
          const adjY = y + dy;
          const adjX = x + dx;
    
          if (
            adjY < 0 ||
            adjY >= this.outputSize ||
            adjX < 0 ||
            adjX >= this.outputSize
          ) {
            continue;
          }
    
          const adjCell = this.output[adjY][adjX];
    
          const prevPossiblePatterns = adjCell.possiblePatterns.slice();
          adjCell.possiblePatterns = this.constrain(adjCell, currentCell);
    
          if (
            prevPossiblePatterns.length !== adjCell.possiblePatterns.length
          ) {
            adjCell.entropy = -1;
            stack.push({ x: adjX, y: adjY });
          }
        }
      }
    }}

    constrain(adjCell, currentCell) {
    const possiblePatterns = [];
    for (const adjPatternKey of adjCell.possiblePatterns) {
      for (const curPatternKey of currentCell.possiblePatterns) {
        if (this.patternsCompatible(adjPatternKey, curPatternKey)) {
          possiblePatterns.push(adjPatternKey);
          break;
        }
      }
    }
    
    return possiblePatterns;
  }

  patternsCompatible(patternKey1, patternKey2) {
  const pattern1 = patternKey1.split(',');
  const pattern2 = patternKey2.split(',');
  for (let y = 0; y < this.patternSize - 1; y++) {
    for (let x = 0; x < this.patternSize - 1; x++) {
      const index1 = y * this.patternSize + x;
      const index2 = (y + 1) * this.patternSize + x + 1;
  
      if (pattern1[index1] !== pattern2[index2]) {
        return false;
      }
    }
  }
  
  return true;
}

run() {
let cell = this.findLowestEntropyCell();
while (cell !== null) {
  this.collapse(cell);
  this.propagate(cell);

  cell = this.findLowestEntropyCell();
}

return this.output.map(row =>
  row.map(cell => parseInt(cell.possiblePatterns[0].split(',')[0]))
);
}
}

// Usage:
const input = [
[1, 0, 1],
[0, 1, 0],
[1, 0, 1]
];
const outputSize = 10;
const patternSize = 2;

const wfc = new WaveFunctionCollapse(input, outputSize, patternSize);
const output = wfc.run();

// module.exports = {wfc,output};


console.log(output);
    
    
