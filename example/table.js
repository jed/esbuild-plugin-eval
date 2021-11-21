let fib = n => n < 2 ? 1 : fib(n - 1) + fib(n - 2)

export default Array.from({length: 30}, (_, n) => fib(n))
