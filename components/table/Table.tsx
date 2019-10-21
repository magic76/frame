import react, { useState } from 'react';
import styled, { css } from 'styled-components';
import get from 'lodash/get';
import { isPerf } from '~/utils/util';

// Related component
import { Ripple } from '~/components/common/LoadingIndicator';

export type Column<T> = {
	// 對應 data 中的 key
	key: string;
	// 欄位顯示名稱
	name: string | React.ReactElement;
	portion?: number;
	clickHandler?: (data: T) => void;
};
interface ITableProps<T> {
	columns: Column<T>[];
	// 優先度高於 Column 裡的 portion
	portions?: number[];
	data: T[];
	loading?: boolean;
	error?: any;
	renderRow?: (data: T, i: number, columns: Column<T>[]) => React.ReactElement;
}

let temp: number = 0;
const Table = <T extends any>(props: ITableProps<T>) => {
	const { columns, portions, data, loading, error, renderRow } = props;
	const portionList = Array.isArray(portions)
		? portions
		: columns.map(column => column.portion || 100 / columns.length);
	const [currentPortions, setCurrentPortions] = useState(portionList);

	return (
		<TableWrapper portions={currentPortions}>
			<thead>
				<tr>
					{columns.map((column, i) => {
						return (
							<th key={column.key} scope="column" style={{ position: 'relative' }}>
								{column.name}
								<MoveBar
									draggable={true}
									onDragStart={e => {
										temp = e.clientX;
										console.log(e.clientX);
									}}
									onDragEnd={e => {
										e.preventDefault();
										e.stopPropagation();
										const tableTr = get(e, 'target.parentElement.parentElement.clientWidth') || {};
										const tableTrWidth = tableTr.clientWidth || 1000;
										const offset = ((e.clientX - temp) / tableTrWidth) * 100;
										setCurrentPortions(
											currentPortions.map((portion, portionI) => {
												return portionI === i ? portion + offset : portion;
											}),
										);
									}}
								></MoveBar>
							</th>
						);
					})}
				</tr>
			</thead>
			<tbody>
				{loading && (
					<tr>
						<td colSpan={columns.length}>
							<LoadingWrapper>
								<Ripple />
							</LoadingWrapper>
						</td>
					</tr>
				)}
				{!loading && error && (
					<tr>
						<td colSpan={columns.length}>Error</td>
					</tr>
				)}
				{!loading && !error && data.length < 1 && (
					<tr>
						<td colSpan={columns.length}>No Data</td>
					</tr>
				)}
				{!loading && !error && (
					<>
						{data.map(
							renderRow
								? (item, i) => renderRow(item, i, columns)
								: (item, i) => {
										return (
											<tr key={i}>
												{columns.map(head => {
													const onClick = head.clickHandler
														? () => head.clickHandler && head.clickHandler(item)
														: () => {};
													return (
														<td
															key={`${head.key}_${i}`}
															onClick={onClick}
															style={{ cursor: head.clickHandler ? 'pointer' : '' }}
														>
															{get(item, head.key)}
														</td>
													);
												})}
											</tr>
										);
								  },
						)}
					</>
				)}
			</tbody>
		</TableWrapper>
	);
};

export default Table;

// Styled components

const MoveBar = styled.span`
	position: absolute;
	height: 25px;
	width: 10px;
	right: 0px;
	top: 0px;
	cursor: pointer;
	${isPerf ? 'background-color: #ffffff;' : ''}
`;
const LoadingWrapper = styled.div`
	display: flex;
	width: 100%;
	justify-content: center;
	align-items: center;
	padding: 64px;
`;

const TableWrapper = styled.table<{ portions?: number[] }>`
	table-layout: fixed;
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
	background-color: #fff;
	border-radius: 2px;
	overflow: hidden;
	box-shadow: 1px 5px 10px rgba(0, 0, 0, 0.12), -1px 1px 3px rgba(0, 0, 0, 0.16);
	margin-bottom: 24px;

	thead {
		background-color: black;
		color: #fff;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-size: 12px;
	}

	tr {
		overflow-wrap: break-word;
		&:not(:last-child) {
			border-bottom: 1px solid #e4e8f3;
		}

		&:hover {
			background-color: rgba(128, 128, 128, 0.1);
			transition: background-color 0.15s ease;
		}

		${props => {
			const { portions } = props;
			if (!Array.isArray(portions)) {
				return '';
			}
			return portions.map((portion, i) => {
				return css`
					> *:nth-child(${i + 1}) {
						width: ${portion}%;
					}
				`;
			});
		}}
	}

	th {
		font-weight: normal;
	}

	th,
	td {
		padding: 4px 8px;
		text-align: center;

		&:first-child {
			text-align: left;
		}
	}
`;
