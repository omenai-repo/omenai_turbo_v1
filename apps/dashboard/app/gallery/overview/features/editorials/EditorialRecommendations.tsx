"use client";
import OverviewComponentCard from "../../components/OverviewComponentCard";

import "pure-react-carousel/dist/react-carousel.es.css";
export default function EditorialRecommendations() {
  return (
    <div>
      <OverviewComponentCard
        id="tour-external-links"
        fullWidth={false}
        title="Latest editorial articles"
      >
        <h4>Editorial data goes here</h4>
        {/* </Carousel> */}
      </OverviewComponentCard>
    </div>
  );
}
