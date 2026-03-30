export const C = {
  ink:      '#1a1208',
  paper:    '#faf6ef',
  paperDim: '#f2ece0',
  gold:     '#b8892a',
  goldPale: '#f5e9c8',
  goldMid:  '#d4a843',
  muted:    '#8a7a62',
  border:   '#e0d5c0',
  white:    '#ffffff',
  sage:     '#4a6e4c',
  sagePale: '#eaf2ea',
  rust:     '#9b4a2a',
};

export const LISTING_FIELDS = [
  { id: 'product_name',            label: 'Product name',                   type: 'text',   required: true  },
  { id: 'what_it_is',              label: 'What is it?',                    type: 'text',   required: true  },
  { id: 'materials',               label: 'Materials',                      type: 'text',   required: false },
  { id: 'who_it_is_for',           label: 'Who is it for?',                 type: 'text',   required: true  },
  { id: 'occasion',                label: 'Occasion',                       type: 'text',   required: false },
  { id: 'key_features',            label: 'Key features (comma separated)', type: 'text',   required: true  },
  { id: 'personalisation',         label: 'Personalisation details',        type: 'text',   required: false },
  { id: 'size_dimensions',         label: 'Size / dimensions',              type: 'text',   required: false },
  { id: 'main_keyword',            label: 'Primary keyword',                type: 'text',   required: false },
  { id: 'price_position_override', label: 'Price override (optional)',      type: 'select', required: false,
    options: ['', 'budget', 'mid', 'premium'] },
];
