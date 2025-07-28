import React from 'react';

interface SquareBookmarkTopProps extends React.SVGProps<SVGSVGElement> {}

const SquareBookmarkTop: React.FC<SquareBookmarkTopProps> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 2.25C4.15279 2.25 2.25 4.15279 2.25 6.5V17.5C2.25 19.8472 4.15279 21.75 6.5 21.75H17.5C19.8472 21.75 21.75 19.8472 21.75 17.5V6.5C21.75 4.15279 19.8472 2.25 17.5 2.25H6.5ZM8 3.75H6.5C4.98122 3.75 3.75 4.98122 3.75 6.5V17.5C3.75 19.0188 4.98122 20.25 6.5 20.25H17.5C19.0188 20.25 20.25 19.0188 20.25 17.5V6.5C20.25 4.98122 19.0188 3.75 17.5 3.75H16V11.3336C16 12.6267 14.4732 13.3138 13.5053 12.4563L12 11.1227L10.4947 12.4563C9.52679 13.3138 8 12.6267 8 11.3336V3.75ZM14.5 3.75V11.3336L12.9947 9.99997C12.4269 9.49699 11.5731 9.49699 11.0053 9.99997L9.5 11.3336V3.75H14.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SquareBookmarkTop; 