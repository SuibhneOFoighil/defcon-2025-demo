import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { useState } from 'react';

import MultipleSelector, { type Option } from '@/components/ui/multi-selector';

const meta: Meta<typeof MultipleSelector> = {
  title: 'UI/MultipleSelector',
  component: MultipleSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultipleSelector>;

const mockOptions: Option[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const groupedOptions: Option[] = [
  { value: 'apple', label: 'Apple', category: 'Fruits' },
  { value: 'banana', label: 'Banana', category: 'Fruits' },
  { value: 'carrot', label: 'Carrot', category: 'Vegetables' },
  { value: 'broccoli', label: 'Broccoli', category: 'Vegetables' },
  { value: 'chicken', label: 'Chicken', category: 'Proteins' },
  { value: 'salmon', label: 'Salmon', category: 'Proteins' },
];

export const Default: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
  },
};

export const WithDefaultValues: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [mockOptions[0], mockOptions[1]],
  },
};

export const WithMaxSelected: Story = {
  args: {
    placeholder: 'Select up to 3 items...',
    options: mockOptions,
    maxSelected: 3,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [mockOptions[0], mockOptions[1]],
    disabled: true,
  },
};

export const WithFixedOptions: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [
      { ...mockOptions[0], fixed: true },
      mockOptions[1],
    ],
  },
};

export const Grouped: Story = {
  args: {
    placeholder: 'Select items...',
    options: groupedOptions,
    groupBy: 'category',
  },
};

export const Creatable: Story = {
  args: {
    placeholder: 'Type to create or select...',
    options: mockOptions,
    creatable: true,
  },
};

export const WithAsyncSearch: Story = {
  render: (args) => {
    const [searchOptions, setSearchOptions] = useState<Option[]>([]);
    
    const handleSearch = async (value: string): Promise<Option[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = mockOptions.filter(option => 
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      setSearchOptions(filtered);
      return filtered;
    };
    
    return (
      <MultipleSelector
        {...args}
        onSearch={handleSearch}
        loadingIndicator={<div className="p-2 text-sm text-muted-foreground">Loading...</div>}
        emptyIndicator={<div className="p-2 text-sm text-muted-foreground">No results found</div>}
      />
    );
  },
  args: {
    placeholder: 'Type to search...',
    triggerSearchOnFocus: true,
  },
};

export const WithSyncSearch: Story = {
  args: {
    placeholder: 'Type to search...',
    onSearchSync: (value: string) => 
      mockOptions.filter(option => 
        option.label.toLowerCase().includes(value.toLowerCase())
      ),
    emptyIndicator: <div className="p-2 text-sm text-muted-foreground">No results found</div>,
  },
};

export const HidePlaceholderWhenSelected: Story = {
  args: {
    placeholder: 'This placeholder will hide when items are selected',
    options: mockOptions,
    hidePlaceholderWhenSelected: true,
  },
};

export const WithCustomBadgeClassName: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [mockOptions[0], mockOptions[1]],
    badgeClassName: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
};

export const WithClearAllButton: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [mockOptions[0], mockOptions[1], mockOptions[2]],
  },
};

export const WithoutClearAllButton: Story = {
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
    value: [mockOptions[0], mockOptions[1], mockOptions[2]],
    hideClearAllButton: true,
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    
    return (
      <div className="w-80">
        <MultipleSelector
          {...args}
          value={selectedOptions}
          onChange={setSelectedOptions}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          Selected: {selectedOptions.map(option => option.label).join(', ') || 'None'}
        </div>
      </div>
    );
  },
  args: {
    placeholder: 'Select items...',
    options: mockOptions,
  },
};

export const WithKeyboardNavigation: Story = {
  args: {
    placeholder: 'Use keyboard to navigate...',
    options: mockOptions,
  },
};

export const ConstrainedWidthWithManyBadges: Story = {
  render: (args) => {
    const longOptions: Option[] = [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'csharp', label: 'C#' },
      { value: 'cpp', label: 'C++' },
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
      { value: 'swift', label: 'Swift' },
      { value: 'kotlin', label: 'Kotlin' },
      { value: 'ruby', label: 'Ruby' },
      { value: 'php', label: 'PHP' },
    ];
    
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
      longOptions[0],
      longOptions[1],
      longOptions[2],
      longOptions[3],
      longOptions[4],
      longOptions[5],
      longOptions[6],
      longOptions[7],
    ]);
    
    return (
      <div className="w-64">
        <MultipleSelector
          {...args}
          value={selectedOptions}
          onChange={setSelectedOptions}
          options={longOptions}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          Container width: 16rem (256px) with 8 badges
        </div>
      </div>
    );
  },
  args: {
    placeholder: 'Select languages...',
  },
};

export const VeryNarrowWidthWithBadges: Story = {
  render: (args) => {
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
      mockOptions[0],
      mockOptions[1],
      mockOptions[2],
      mockOptions[3],
      mockOptions[4],
    ]);
    
    return (
      <div className="w-48">
        <MultipleSelector
          {...args}
          value={selectedOptions}
          onChange={setSelectedOptions}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          Container width: 12rem (192px) with 5 badges
        </div>
      </div>
    );
  },
  args: {
    placeholder: 'Very narrow...',
    options: mockOptions,
  },
};

export const WithManyOptions: Story = {
  render: (args) => {
    const manyOptions: Option[] = [
      { value: 'afghanistan', label: 'Afghanistan' },
      { value: 'albania', label: 'Albania' },
      { value: 'algeria', label: 'Algeria' },
      { value: 'andorra', label: 'Andorra' },
      { value: 'angola', label: 'Angola' },
      { value: 'argentina', label: 'Argentina' },
      { value: 'armenia', label: 'Armenia' },
      { value: 'australia', label: 'Australia' },
      { value: 'austria', label: 'Austria' },
      { value: 'azerbaijan', label: 'Azerbaijan' },
      { value: 'bahamas', label: 'Bahamas' },
      { value: 'bahrain', label: 'Bahrain' },
      { value: 'bangladesh', label: 'Bangladesh' },
      { value: 'barbados', label: 'Barbados' },
      { value: 'belarus', label: 'Belarus' },
      { value: 'belgium', label: 'Belgium' },
      { value: 'belize', label: 'Belize' },
      { value: 'benin', label: 'Benin' },
      { value: 'bhutan', label: 'Bhutan' },
      { value: 'bolivia', label: 'Bolivia' },
      { value: 'bosnia', label: 'Bosnia and Herzegovina' },
      { value: 'botswana', label: 'Botswana' },
      { value: 'brazil', label: 'Brazil' },
      { value: 'brunei', label: 'Brunei' },
      { value: 'bulgaria', label: 'Bulgaria' },
      { value: 'burkina', label: 'Burkina Faso' },
      { value: 'burundi', label: 'Burundi' },
      { value: 'cambodia', label: 'Cambodia' },
      { value: 'cameroon', label: 'Cameroon' },
      { value: 'canada', label: 'Canada' },
      { value: 'cape-verde', label: 'Cape Verde' },
      { value: 'chad', label: 'Chad' },
      { value: 'chile', label: 'Chile' },
      { value: 'china', label: 'China' },
      { value: 'colombia', label: 'Colombia' },
      { value: 'comoros', label: 'Comoros' },
      { value: 'congo', label: 'Congo' },
      { value: 'costa-rica', label: 'Costa Rica' },
      { value: 'croatia', label: 'Croatia' },
      { value: 'cuba', label: 'Cuba' },
      { value: 'cyprus', label: 'Cyprus' },
      { value: 'czech', label: 'Czech Republic' },
      { value: 'denmark', label: 'Denmark' },
      { value: 'djibouti', label: 'Djibouti' },
      { value: 'dominica', label: 'Dominica' },
      { value: 'dominican', label: 'Dominican Republic' },
      { value: 'ecuador', label: 'Ecuador' },
      { value: 'egypt', label: 'Egypt' },
      { value: 'el-salvador', label: 'El Salvador' },
      { value: 'estonia', label: 'Estonia' },
      { value: 'ethiopia', label: 'Ethiopia' },
      { value: 'fiji', label: 'Fiji' },
      { value: 'finland', label: 'Finland' },
      { value: 'france', label: 'France' },
      { value: 'gabon', label: 'Gabon' },
      { value: 'gambia', label: 'Gambia' },
      { value: 'georgia', label: 'Georgia' },
      { value: 'germany', label: 'Germany' },
      { value: 'ghana', label: 'Ghana' },
      { value: 'greece', label: 'Greece' },
      { value: 'grenada', label: 'Grenada' },
      { value: 'guatemala', label: 'Guatemala' },
      { value: 'guinea', label: 'Guinea' },
      { value: 'guyana', label: 'Guyana' },
      { value: 'haiti', label: 'Haiti' },
      { value: 'honduras', label: 'Honduras' },
      { value: 'hungary', label: 'Hungary' },
      { value: 'iceland', label: 'Iceland' },
      { value: 'india', label: 'India' },
      { value: 'indonesia', label: 'Indonesia' },
      { value: 'iran', label: 'Iran' },
      { value: 'iraq', label: 'Iraq' },
      { value: 'ireland', label: 'Ireland' },
      { value: 'israel', label: 'Israel' },
      { value: 'italy', label: 'Italy' },
      { value: 'jamaica', label: 'Jamaica' },
      { value: 'japan', label: 'Japan' },
      { value: 'jordan', label: 'Jordan' },
      { value: 'kazakhstan', label: 'Kazakhstan' },
      { value: 'kenya', label: 'Kenya' },
      { value: 'kiribati', label: 'Kiribati' },
      { value: 'korea-north', label: 'North Korea' },
      { value: 'korea-south', label: 'South Korea' },
      { value: 'kuwait', label: 'Kuwait' },
      { value: 'kyrgyzstan', label: 'Kyrgyzstan' },
      { value: 'laos', label: 'Laos' },
      { value: 'latvia', label: 'Latvia' },
      { value: 'lebanon', label: 'Lebanon' },
      { value: 'lesotho', label: 'Lesotho' },
      { value: 'liberia', label: 'Liberia' },
      { value: 'libya', label: 'Libya' },
      { value: 'liechtenstein', label: 'Liechtenstein' },
      { value: 'lithuania', label: 'Lithuania' },
      { value: 'luxembourg', label: 'Luxembourg' },
      { value: 'madagascar', label: 'Madagascar' },
      { value: 'malawi', label: 'Malawi' },
      { value: 'malaysia', label: 'Malaysia' },
      { value: 'maldives', label: 'Maldives' },
      { value: 'mali', label: 'Mali' },
      { value: 'malta', label: 'Malta' },
      { value: 'marshall', label: 'Marshall Islands' },
      { value: 'mauritania', label: 'Mauritania' },
      { value: 'mauritius', label: 'Mauritius' },
      { value: 'mexico', label: 'Mexico' },
      { value: 'micronesia', label: 'Micronesia' },
      { value: 'moldova', label: 'Moldova' },
      { value: 'monaco', label: 'Monaco' },
      { value: 'mongolia', label: 'Mongolia' },
      { value: 'montenegro', label: 'Montenegro' },
      { value: 'morocco', label: 'Morocco' },
      { value: 'mozambique', label: 'Mozambique' },
      { value: 'myanmar', label: 'Myanmar' },
      { value: 'namibia', label: 'Namibia' },
      { value: 'nauru', label: 'Nauru' },
      { value: 'nepal', label: 'Nepal' },
      { value: 'netherlands', label: 'Netherlands' },
      { value: 'new-zealand', label: 'New Zealand' },
      { value: 'nicaragua', label: 'Nicaragua' },
      { value: 'niger', label: 'Niger' },
      { value: 'nigeria', label: 'Nigeria' },
      { value: 'norway', label: 'Norway' },
      { value: 'oman', label: 'Oman' },
      { value: 'pakistan', label: 'Pakistan' },
      { value: 'palau', label: 'Palau' },
      { value: 'panama', label: 'Panama' },
      { value: 'papua', label: 'Papua New Guinea' },
      { value: 'paraguay', label: 'Paraguay' },
      { value: 'peru', label: 'Peru' },
      { value: 'philippines', label: 'Philippines' },
      { value: 'poland', label: 'Poland' },
      { value: 'portugal', label: 'Portugal' },
      { value: 'qatar', label: 'Qatar' },
      { value: 'romania', label: 'Romania' },
      { value: 'russia', label: 'Russia' },
      { value: 'rwanda', label: 'Rwanda' },
      { value: 'saint-kitts', label: 'Saint Kitts and Nevis' },
      { value: 'saint-lucia', label: 'Saint Lucia' },
      { value: 'saint-vincent', label: 'Saint Vincent and the Grenadines' },
      { value: 'samoa', label: 'Samoa' },
      { value: 'san-marino', label: 'San Marino' },
      { value: 'saudi-arabia', label: 'Saudi Arabia' },
      { value: 'senegal', label: 'Senegal' },
      { value: 'serbia', label: 'Serbia' },
      { value: 'seychelles', label: 'Seychelles' },
      { value: 'sierra-leone', label: 'Sierra Leone' },
      { value: 'singapore', label: 'Singapore' },
      { value: 'slovakia', label: 'Slovakia' },
      { value: 'slovenia', label: 'Slovenia' },
      { value: 'solomon', label: 'Solomon Islands' },
      { value: 'somalia', label: 'Somalia' },
      { value: 'south-africa', label: 'South Africa' },
      { value: 'south-sudan', label: 'South Sudan' },
      { value: 'spain', label: 'Spain' },
      { value: 'sri-lanka', label: 'Sri Lanka' },
      { value: 'sudan', label: 'Sudan' },
      { value: 'suriname', label: 'Suriname' },
      { value: 'sweden', label: 'Sweden' },
      { value: 'switzerland', label: 'Switzerland' },
      { value: 'syria', label: 'Syria' },
      { value: 'taiwan', label: 'Taiwan' },
      { value: 'tajikistan', label: 'Tajikistan' },
      { value: 'tanzania', label: 'Tanzania' },
      { value: 'thailand', label: 'Thailand' },
      { value: 'timor-leste', label: 'Timor-Leste' },
      { value: 'togo', label: 'Togo' },
      { value: 'tonga', label: 'Tonga' },
      { value: 'trinidad', label: 'Trinidad and Tobago' },
      { value: 'tunisia', label: 'Tunisia' },
      { value: 'turkey', label: 'Turkey' },
      { value: 'turkmenistan', label: 'Turkmenistan' },
      { value: 'tuvalu', label: 'Tuvalu' },
      { value: 'uganda', label: 'Uganda' },
      { value: 'ukraine', label: 'Ukraine' },
      { value: 'uae', label: 'United Arab Emirates' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'usa', label: 'United States' },
      { value: 'uruguay', label: 'Uruguay' },
      { value: 'uzbekistan', label: 'Uzbekistan' },
      { value: 'vanuatu', label: 'Vanuatu' },
      { value: 'vatican', label: 'Vatican City' },
      { value: 'venezuela', label: 'Venezuela' },
      { value: 'vietnam', label: 'Vietnam' },
      { value: 'yemen', label: 'Yemen' },
      { value: 'zambia', label: 'Zambia' },
      { value: 'zimbabwe', label: 'Zimbabwe' },
    ];
    
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    
    return (
      <div className="w-96">
        <MultipleSelector
          {...args}
          value={selectedOptions}
          onChange={setSelectedOptions}
          options={manyOptions}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          {manyOptions.length} options available
        </div>
      </div>
    );
  },
  args: {
    placeholder: 'Search from 195 countries...',
  },
};

