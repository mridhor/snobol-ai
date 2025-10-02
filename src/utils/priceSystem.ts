import { PriceCounter } from './PriceCounter';

export let currentSnobolPrice = 18.8188;
export let currentSP500Price = 3.3006;

export const priceCounter = new PriceCounter(
  currentSnobolPrice,
  (updatedPrice: number) => {
    currentSnobolPrice = updatedPrice;
    localStorage.setItem("latestSnobolPrice", updatedPrice.toString());
  },
  (updatedSP500Price: number) => {
    currentSP500Price = updatedSP500Price;
  }
);
