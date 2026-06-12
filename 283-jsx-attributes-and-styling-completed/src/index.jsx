import React from "react";
import ReactDOM from "react-dom";

// Random placeholder image base
const randomImg = "https://picsum.photos/400";

const foods = [
  {
    alt: "Bacon",
    src:
      "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/delish-190621-air-fryer-bacon-0035-landscape-pf-1567632709.jpg?crop=0.645xw:0.967xh;0.170xw,0.0204xh&resize=480:*",
    caption: "Crispy Bacon"
  },
  {
    alt: "Jamon",
    src: "https://images-na.ssl-images-amazon.com/images/I/71lNrnbMXsL._SL1200_.jpg",
    caption: "Iberico Jamón"
  },
  {
    alt: "Noodles",
    src: "https://www.errenskitchen.com/wp-content/uploads/2014/04/quick-and-easy-chinese-noodle-soup3-1.jpg",
    caption: "Comfort Noodle Soup"
  }
];

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <h1 className="heading gradient-text">My Favourite Foods</h1>
        <p className="tagline">A tiny responsive gallery rendered with React & Vite</p>
      </header>
      <div className="gallery" role="list" aria-label="Favourite foods gallery">
        {foods.map((f) => (
          <figure key={f.alt} className="card" role="listitem">
            <img
              className="food-img"
              alt={f.alt}
              src={f.src}
              loading="lazy"
              width={300}
              height={300}
            />
            <figcaption>{f.caption}</figcaption>
          </figure>
        ))}
        <figure className="card" role="listitem">
          <img
            className="food-img"
            alt="Random grayscale"
            src={randomImg + "?grayscale"}
            loading="lazy"
            width={300}
            height={300}
          />
          <figcaption>Random Grayscale</figcaption>
        </figure>
      </div>
      <footer className="site-footer">
        <small>
          Images from public sources. Hover / focus cards for a subtle 3D effect.
        </small>
      </footer>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
