import { ComparisonFunction, SortingResult, SortingAlgorithm } from './sorting.types';

export class SortingAlgorithms {
  /**
   * QUICKSORT - divide & conquer
   * - complexidade: O(n log n) média, O(n²) pior caso
   * - NÃO estável
   * - inplace
   */
  static quickSort<T>(
    arr: T[],
    compareFn: ComparisonFunction<T>,
    left = 0,
    right = arr.length - 1
  ): T[] {
    const copy = [...arr];
    
    const partition = (low: number, high: number): number => {
      const pivot = copy[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        if (compareFn(copy[j], pivot) < 0) {
          i++;
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
      }
      [copy[i + 1], copy[high]] = [copy[high], copy[i + 1]];
      return i + 1;
    };
    
    const sort = (low: number, high: number): void => {
      if (low < high) {
        const pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    };
    
    sort(left, right);
    return copy;
  }

  /**
   * MERGESORT - divide & conquer estável
   * - complexidade: O(n log n) 
   * - ESTÁVEL - mantém ordem relativa de iguais
   * - Não in-place
   */
  static mergeSort<T>(
    arr: T[],
    compareFn: ComparisonFunction<T>
  ): T[] {
    if (arr.length <= 1) return [...arr];
    
    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), compareFn);
    const right = this.mergeSort(arr.slice(mid), compareFn);
    
    return this.merge(left, right, compareFn);
  }

  private static merge<T>(
    left: T[],
    right: T[],
    compareFn: ComparisonFunction<T>
  ): T[] {
    const result: T[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (compareFn(left[i], right[j]) <= 0) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }
    
    return [...result, ...left.slice(i), ...right.slice(j)];
  }

    /**
   * INSERTIONSORT - algoritmo incremental
   * - complexidade: O(n²) no pior caso
   * - melhor caso: O(n), quando a lista já está quase ordenada
   * - ESTÁVEL
   * - ideal para listas pequenas
   */
  static insertionSort<T>(
    arr: T[],
    compareFn: ComparisonFunction<T>
  ): T[] {
    const copy = [...arr];
  
    for (let i = 1; i < copy.length; i++) {
      const current = copy[i];
      let j = i - 1;
  
      while (j >= 0 && compareFn(copy[j], current) > 0) {
        copy[j + 1] = copy[j];
        j--;
      }
  
      copy[j + 1] = current;
    }
  
      return copy;
  }
  
    /**
     * RADIXSORT - algoritmo não comparativo para números inteiros
     * - complexidade: O(n * k), onde k é a quantidade de dígitos
     * - ideal para ordenar IDs e valores inteiros
     * - esta implementação aceita números positivos e negativos
     */
  static radixSort(arr: number[], ascending = true): number[] {
    if (arr.length <= 1) return [...arr];
  
    const positives = arr.filter((num) => num >= 0);
    const negatives = arr
      .filter((num) => num < 0)
      .map((num) => Math.abs(num));
  
    const sortedPositives = this.radixSortPositiveNumbers(positives);
    const sortedNegatives = this.radixSortPositiveNumbers(negatives)
      .reverse()
      .map((num) => -num);
  
    const result = [...sortedNegatives, ...sortedPositives];
  
    return ascending ? result : result.reverse();
  }
  
    /**
     * função auxiliar do RadixSort para números inteiros positivos
     */
  private static radixSortPositiveNumbers(arr: number[]): number[] {
    if (arr.length <= 1) return [...arr];
  
    let result = [...arr];
    const max = Math.max(...result);
    let exp = 1;
  
    while (Math.floor(max / exp) > 0) {
      result = this.countingSortByDigit(result, exp);
      exp *= 10;
    }
  
    return result;
    }
  
    /**
     * CountingSort auxiliar usado pelo RadixSort para ordenar por dígito
     */
  private static countingSortByDigit(arr: number[], exp: number): number[] {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);
  
    for (const num of arr) {
      const digit = Math.floor(num / exp) % 10;
      count[digit]++;
    }
  
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
  
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
  
    return output;
  }

  /**
   * benchmark - compara tempo de execução entre algoritmos
   */
  static benchmark<T>(
    data: T[],
    algorithms: {
      name: SortingAlgorithm;
      fn: (arr: T[]) => T[];
    }[],
  ): SortingResult<T>[] {
    return algorithms.map(({ name, fn }) => {
      const start = performance.now();
      const sorted = fn([...data]);
      const end = performance.now();

      return {
        data: sorted,
        algorithm: name,
        executionTimeMs: parseFloat((end - start).toFixed(3)),
        originalSize: data.length,
      };
    });
  }

  /**
   * função auxiliar: cria função de comparação para campo específico
   * utilizar para ordenar objetos por propriedade
   */
  static createComparator<T>(
    fieldName: keyof T,
    ascending = true,
  ): ComparisonFunction<T> {
    return (a: T, b: T): number => {
      const aVal = a[fieldName];
      const bVal = b[fieldName];

      if (aVal < bVal) {
        return ascending ? -1 : 1;
      }
      if (aVal > bVal) {
        return ascending ? 1 : -1;
      }
      return 0;
    };
  }

  /**
   * função auxiliar: cria função de comparação customizada
   * para comparações complexas (ex: por campo + sub-campo)
   */
  static composeComparators<T>(
    ...compareFns: ComparisonFunction<T>[]
  ): ComparisonFunction<T> {
    return (a: T, b: T): number => {
      for (const compareFn of compareFns) {
        const result = compareFn(a, b);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    };
  }
}

