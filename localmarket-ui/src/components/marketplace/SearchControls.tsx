import { MapPin, Navigation, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchControlsProps = {
  query: string;
  setQuery: (value: string) => void;
  distanceFilter: string;
  setDistanceFilter: (value: string) => void;
  priceSort: string;
  setPriceSort: (value: string) => void;
  latitude: string;
  longitude: string;
  setLatitude: (value: string) => void;
  setLongitude: (value: string) => void;
  onSearch: () => void;
  onUseLocation: () => void;
  loading: boolean;
};

export function SearchControls(props: SearchControlsProps) {
  return (
    <div className="search-controls">
      <div className="search-primary">
        <div className="search-input-shell">
          <Search className="size-5 text-slate-400" />
          <Input
            value={props.query}
            onChange={(event) => props.setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                props.onSearch();
              }
            }}
            placeholder="Search products, stores, categories..."
          />
        </div>
        <Button type="button" size="lg" disabled={props.loading} onClick={props.onSearch}>
          <Search className="size-4" />
          {props.loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="filter-row">
        <div className="coordinate-grid">
          <label className="soft-field">
            <MapPin className="size-4" />
            <Input
              value={props.latitude}
              onChange={(event) => props.setLatitude(event.target.value)}
              placeholder="Latitude"
            />
          </label>
          <label className="soft-field">
            <MapPin className="size-4" />
            <Input
              value={props.longitude}
              onChange={(event) => props.setLongitude(event.target.value)}
              placeholder="Longitude"
            />
          </label>
        </div>
        <Button type="button" variant="outline" onClick={props.onUseLocation} className="location-button">
          <Navigation className="size-4" />
          Use my location
        </Button>
      </div>

      <div className="filter-row">
        <label className="select-wrap compact">
          <span><SlidersHorizontal className="size-3.5" /> Distance</span>
          <select value={props.distanceFilter} onChange={(event) => props.setDistanceFilter(event.target.value)}>
            <option value="all">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
          </select>
        </label>
        <label className="select-wrap compact">
          <span><SlidersHorizontal className="size-3.5" /> Sort</span>
          <select value={props.priceSort} onChange={(event) => props.setPriceSort(event.target.value)}>
            <option value="distance">Nearest first</option>
            <option value="priceAsc">Lowest price</option>
            <option value="priceDesc">Highest price</option>
          </select>
        </label>
      </div>
    </div>
  );
}
