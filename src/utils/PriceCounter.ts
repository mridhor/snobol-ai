export class PriceCounter {
  private manualBasePrice: number;
  private onPriceUpdate: (price: number) => void;
  private onSP500Update: (sp500Price: number) => void;
  private currentSP500Price: number;
  private fluctuationDirection: number = 1;
  private priceInterval: NodeJS.Timeout | null = null;

  constructor(
    initialPrice: number,
    onPriceUpdate: (price: number) => void,
    onSP500Update: (sp500Price: number) => void
  ) {
    this.manualBasePrice = initialPrice;
    this.onPriceUpdate = onPriceUpdate;
    this.onSP500Update = onSP500Update;
    this.currentSP500Price = 3.3006;
    console.log("PriceCounter Initialized - Initial Price:", initialPrice);
  }

  start() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
      console.log("PriceCounter - Cleared existing interval");
    }

    const deterministicFluctuationSeed = (seed: number): number => {
      return (Math.sin(seed * 9301 + 49297) * 233280) % 1;
    };

    const updatePrice = () => {
      const seed = Math.floor(Date.now() / 2000);
      const pseudoRand = deterministicFluctuationSeed(seed);
      const minP = 0.00002, maxP = 0.00008;
      const randP = pseudoRand * (maxP - minP) + minP;
      const fluct = this.manualBasePrice * randP * this.fluctuationDirection;
      const adjusted = this.manualBasePrice + fluct;

      console.log("PriceCounter - Update Tick:", {
        basePrice: this.manualBasePrice,
        fluctuation: fluct,
        adjustedPrice: adjusted,
        direction: this.fluctuationDirection
      });

      if (!isNaN(adjusted)) {
        this.onPriceUpdate(adjusted);
        this.onSP500Update(this.currentSP500Price);
      } else {
        console.error("PriceCounter - Invalid price calculated, using base price:", this.manualBasePrice);
        this.onPriceUpdate(this.manualBasePrice);
        this.onSP500Update(this.currentSP500Price);
      }
      this.fluctuationDirection *= -1;
    };

    console.log("PriceCounter - Starting interval");
    updatePrice();
    this.priceInterval = setInterval(updatePrice, 2000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (this.priceInterval) {
          clearInterval(this.priceInterval);
          this.priceInterval = null;
          console.log("PriceCounter - Paused due to tab inactivity");
        }
      } else {
        if (!this.priceInterval) {
          console.log("PriceCounter - Resuming interval due to tab activity");
          this.priceInterval = setInterval(updatePrice, 2000);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  stop() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
      this.priceInterval = null;
      console.log("PriceCounter - Stopped interval");
    }
  }

  setManualBasePrice(newPrice: number) {
    this.manualBasePrice = newPrice;
    console.log("PriceCounter - Set new base price:", newPrice);
  }
}
