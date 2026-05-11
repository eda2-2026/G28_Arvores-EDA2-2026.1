/**
 * função de comparação para ordenação
 * retorna:
 *  < 0 se a < b
 *  = 0 se a = b
 *  > 0 se a > b
 */
export type ComparisonFunction<T> = (a: T, b: T) => number;
export type SortingAlgorithm =
  | 'quicksort'
  | 'mergesort'
  | 'radixsort'
  | 'insertionsort'
  | 'native';


export interface SortingResult<T> {
  /** array ordenado */
  data: T[];
  /** algoritmo usado */
  algorithm: SortingAlgorithm;
  /** tempo de execução em ms */
  executionTimeMs: number;
  /** tamanho original do array */
  originalSize: number;
}

/**
 * configuração de ordenação
 */
export interface SortConfig<T> {
  /** função de comparação */
  compare: ComparisonFunction<T>;
  /** algoritmo a usar (padrão: quicksort) */
  algorithm?: SortingAlgorithm;
  /** medir tempo de execução */
  benchmark?: boolean;
}

/**
 * opção de campo para ordenação simples
 */
export interface SortOption {
  label: string;
  value: string;
  algorithm: SortingAlgorithm;
}

/**
 * opção usada pelo componente AlgoritmoSelector
 */
export interface AlgorithmSelectorOption {
  label: string;
  value: SortingAlgorithm;
}

/**
 * props do componente AlgoritmoSelector
 */
export interface AlgorithmSelectorProps {
  value: SortingAlgorithm;
  onChange: (algorithm: SortingAlgorithm) => void;
  options?: AlgorithmSelectorOption[];
  label?: string;
}