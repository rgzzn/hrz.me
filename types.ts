import React from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface OrbProps {
    label: string;
    subLabel?: string;
    href: string;
    position: 'top-left' | 'bottom-right';
    delay?: number;
    icon: React.ElementType;
}

export interface CursorTrailPoint extends Point {
    age: number; // 0 to 1 life
    color: string;
}