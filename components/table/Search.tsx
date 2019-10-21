import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Related components
import Icon from '~/components/common/Icon';
import LoadingIndicator from '~/components/common/LoadingIndicator';
import { Fade } from '~/components/common/Transitions';
import { IntlMessage } from '~/components/common/Intl';

interface ISearchProps {
	placeholder?: string;
	threshold?: number;
	loading?: boolean;
	error?: any;
	onValueChange: (value: string) => void;
	renderPreview?: (ListItemWrapper: any, currentSearch: string) => any;
	onSubmit: (value: any) => void;
}

const Search: React.FC<ISearchProps> = props => {
	const { placeholder = '', onValueChange, onSubmit, threshold = 0, loading, error, renderPreview } = props;
	const [currentSearch, setCurrentSearch] = useState('');
	const [isFocused, setFocusState] = useState(false);

	return (
		<SearchWrapper>
			<input
				value={currentSearch}
				placeholder={placeholder}
				onChange={e => {
					setCurrentSearch(e.target.value);
					onValueChange(e.target.value);
				}}
				onKeyDown={e => {
					e.keyCode === 13 && onSubmit(currentSearch);
				}}
				onFocus={() => setFocusState(true)}
				onBlur={() => setTimeout(() => setFocusState(false), 500)}
			/>
			<button
				onClick={() => {
					setCurrentSearch('');
					onSubmit('');
				}}
				className="clear"
				hidden={currentSearch.length <= 0}
			>
				<IntlMessage langKey="SEARCH@CLEAR" />
			</button>
			<button onClick={() => onSubmit(currentSearch)} className="submit">
				<Icon name="search" />
			</button>
			<div className="outline" />
			{typeof renderPreview === 'function' && (
				<Fade in={currentSearch.length > threshold && isFocused}>
					<PreviewWrapper>
						<LoadingIndicator loading={loading} error={error}>
							{renderPreview(PreviewListItem, currentSearch)}
						</LoadingIndicator>
					</PreviewWrapper>
				</Fade>
			)}
		</SearchWrapper>
	);
};

export default Search;

// Styled components
const PreviewListItem = styled.div`
	font-size: 12px;
	height: 32px;
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 0 8px;

	&:not(:last-child) {
		border-bottom: 1px solid #e4e8f3;
	}
`;

const PreviewWrapper = styled.div`
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	background-color: #fff;
	border-radius: 2px;
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
`;

const SearchWrapper = styled.div`
	width: 320px;
	height: 32px;
	display: grid;
	grid-template-columns: 1fr 32px 32px;
	border: 1px solid #e4e8f3;
	border-radius: 2px;
	position: relative;
	z-index: 0;
	background-color: #fff;

	input {
		border: 0;
		background-color: transparent;
		font-size: 12px;
		padding: 0 8px;

		&:focus {
			outline: 0;

			& ~ .outline {
				border-color: #555bb7;
			}
		}
	}

	.clear {
		display: flex;
		justify-content: center;
		align-items: center;
		grid-column: 2 / 3;
		border: 0;
		background-color: transparent;
		padding: 0;
		margin: 0;
		font-size: 12px;

		&[hidden] {
			display: none;
		}

		&:focus {
			outline: 0;
		}
	}

	.submit {
		display: flex;
		justify-content: center;
		align-items: center;
		grid-column: 3 / 4;
		border: 0;
		background-color: transparent;
		padding: 0;
		margin: 0;
		font-size: 12px;

		&:focus {
			outline: 0;
		}
	}

	.outline {
		position: absolute;
		z-index: 1;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		border: 1px solid transparent;
		pointer-events: none;
		border-radius: 2px;
	}
`;
