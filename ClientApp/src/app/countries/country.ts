import { City } from "../cities/city";

export interface Country {
  id: number;
  name: string;
  isO2: string;
  isO3: string;
  cities: City[];
}
