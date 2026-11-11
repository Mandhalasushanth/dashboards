export class Maybe<T> {
  readonly $value: T | null | undefined;

  constructor(value: T | null | undefined) {
    this.$value = value;
  }

  static of<U>(value: U | null | undefined): Maybe<U> {
    return new Maybe<U>(value);
  }

  static just<U>(value: U): Maybe<U> {
    return new Maybe<U>(value);
  }

  static nothing<U = never>(): Maybe<U> {
    return new Maybe<U>(null);
  }

  isNothing(): boolean {
    return this.$value === null || this.$value === undefined;
  }

  map<U>(fn: (value: T) => U | null | undefined): Maybe<U> {
    return this.isNothing()
      ? Maybe.nothing<U>()
      : Maybe.of<U>(fn(this.$value as T));
  }

  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return this.isNothing() ? Maybe.nothing<U>() : fn(this.$value as T);
  }

  getOrElse<U = T>(defaultValue: U): T | U {
    return this.isNothing() ? defaultValue : (this.$value as T);
  }
}

export class Result<T, E = string> {
  readonly value: T | null;
  readonly isSuccess: boolean;
  readonly error: E | null;

  constructor(value: T | null, isSuccess: boolean, error: E | null) {
    this.value = value;
    this.isSuccess = isSuccess;
    this.error = error;
  }

  static success<U, F = string>(value: U): Result<U, F> {
    return new Result<U, F>(value, true, null);
  }

  static failure<F, U = never>(error: F): Result<U, F> {
    return new Result<U, F>(null, false, error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess
      ? Result.success<U, E>(fn(this.value as T))
      : Result.failure<E, U>(this.error as E);
  }

  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess
      ? fn(this.value as T)
      : Result.failure<E, U>(this.error as E);
  }

  getOrElse<U = T>(fnOrValue: U | ((error: E | null) => U)): T | U {
    if (this.isSuccess) {
      return this.value as T;
    }
    return typeof fnOrValue === "function"
      ? (fnOrValue as (error: E | null) => U)(this.error)
      : fnOrValue;
  }
}
