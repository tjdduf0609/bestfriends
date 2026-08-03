export type Work = {

  id: number;

  title: string;

  type: 
    | "영화"
    | "드라마"
    | "책"
    | "게임"
    | "공연";

  rating: number;

  review: string;

  date: string;

};