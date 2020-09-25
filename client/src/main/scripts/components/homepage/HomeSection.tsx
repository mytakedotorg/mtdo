import React from "react";

interface HomeSectionProps {
  containerClassName?: string;
  innerContainerClassName?: string;
}

const HomeSection: React.FC<HomeSectionProps> = ({
  children,
  containerClassName,
  innerContainerClassName,
}) => {
  let outerClass = "home__section";
  if (containerClassName) {
    outerClass += ` ${containerClassName}`;
  }
  let innerClass = "home__section-content";
  if (innerContainerClassName) {
    innerClass += ` ${innerContainerClassName}`;
  }
  return (
    <section className={outerClass}>
      <div className={innerClass}>{children}</div>
    </section>
  );
};

export default HomeSection;
