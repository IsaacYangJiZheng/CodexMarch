// https://parzibyte.me/blog/en/2019/10/10/print-receipt-thermal-printer-javascript-css-html/
// https://github.com/rubenruvalcabac/epson-epos-sdk-react
// https://codesandbox.io/p/sandbox/zsackers-cafe-frontend-8ozhzv
// // @ts-nocheck
// // @ts-ignore
// import productPriceFormatter from '../../helpers/ProductPriceFormatter';
// import {
//   useGetCartProducts,
//   useGetCartProductsQuery,
// } from '../../app/services/cart-products';
// import {
//   Address,
//   BranchName,
//   ReceiptProduct,
//   CashierContent as CashierContentContainer,
//   Contact,
//   Discount,
//   DiscountAmount,
//   Date as DateContent,
//   OrderId,
//   Orders,
//   OrderSummary,
//   PrintReceiptButton,
//   ReceiptBody,
//   ReceiptContainer,
//   ReceiptContent,
//   ReceiptFooter,
//   ReceiptHeader,
//   Subtotal,
//   SubtotalAmount,
//   Summary,
//   Tax,
//   TaxAmount,
//   Total,
//   TotalAmount,
//   SummaryContent,
//   CashierInfo,
// } from './components';
// import Order from './Order';
// import {useEffect, useRef, useState} from 'react';
// import {v4 as uuid} from 'uuid';
// import ReactToPrint from 'react-to-print';
// import PopupCashier from '../modals/staff/PopupCashier';
// import {
//   useCreateOrderWalkinMutation,
//   useGetCurrentUser,
// } from '../../app/services';
// import {CartProduct} from '../../model';
// import {SerialPort} from 'serialport';
// import escpos from 'escpos';
// import escposUsb from 'escpos-usb';

// // import { Printer } from '@react-thermal-printer/printer';
// // import html2canvas from 'html2canvas';
// // import {ThermalPrinter, PrinterTypes, CharacterSet, BreakLine} from 'node-thermal-printer'
// // import {JSDOM} from 'jsdom'
// // import printer from 'printer';
// import {Cut, Line, Printer, Text, Row, render} from 'react-thermal-printer';
// // import ThermalPrinter  from 'node-thermal-printer';

// // import {useThermalPrinter } from 'react-thermal-printer';

// import ThermalPrinter, {PrinterTypes} from 'browser-thermal-printer';
// function CashierContent() {
//   const {data: cartProducts, isLoading, isError} = useGetCartProductsQuery();
//   const [port, setPort] = useState(null);
//   let content;
//   const {data: user} = useGetCurrentUser();
//   if (isLoading) content = <h3>Loading...</h3>;

//   if (isError) content = <h3>Something went wrong...</h3>;

//   if (cartProducts?.length === 0) content = <h3>No Orders yet</h3>;
//   else
//     content = cartProducts?.map((cartProduct) => <Order data={cartProduct} />);

//   const componentRef = useRef();
//   const printBtnRef = useRef();
//   const [inputMoney, setInputMoney] = useState(0);
//   const [toggleCashier, setToggleCashier] = useState(false);
//   const printerRef = useRef < any > null;

//   const executePrint = async () => {
//     const receipt = (
//       <Printer type='epson' width={42} characterSet='korea'>
//         <Text size={{width: 2, height: 2}}>9,500원</Text>
//         <Text bold={true}>결제 완료</Text>
//         <br />
//         <Line />
//         <Row left='결제방법' right='체크카드' />
//         <Row left='카드번호' right='123456**********' />
//         <Row left='할부기간' right='일시불' />
//         <Row left='결제금액' right='9,500' />
//         <Row left='부가세액' right='863' />
//         <Row left='공급가액' right='8,637' />
//         <Line />
//         <Row left='맛있는 옥수수수염차 X 2' right='11,000' />
//         <Text>옵션1(500)/옵션2/메모</Text>
//         <Row left='(-) 할인' right='- 500' />
//         <br />
//         <Line />
//         <Row left='합계' right='9,500' />
//         <Row left='(-) 할인 2%' right='- 1,000' />
//         <Line />
//         <Row left='대표' right='김대표' />
//         <Row left='사업자등록번호' right='000-00-00000' />
//         <Row left='대표번호' right='0000-0000' />
//         <Row left='주소' right='어디시 어디구 어디동 몇동몇호' />
//         <Line />
//         <br />
//         <Text align='center'>Wifi: some-wifi / PW: 123123</Text>
//         <Cut />
//       </Printer>
//     );
//     const data = await render(receipt);
//     console.log(data);

//     const port = await window.navigator.serial.requestPort();
//     await port.open({baudRate: 9600});

//     console.log(port);
//     const writer = port.writable?.getWriter();
//     if (writer != null) {
//       const writedData = await writer.write(data);
//       writer.releaseLock();
//       console.log(writedData);
//     }
//   };

//   const handlePrint = async () => {
//     if (printBtnRef.current) {
//       printBtnRef.current.handlePrint();
//     }

//     // await executePrint() experimental
//   };

//   const calculateAmount = (totalValue, cartProduct) => {
//     // calculate add ons
//     if (
//       cartProduct.Cart_Product_Variant &&
//       cartProduct.Cart_Product_Variant?.length > 0
//     ) {
//       const addonPrice = cartProduct.Cart_Product_Variant.reduce(
//         (total, cartVariant) => {
//           const addonPrice =
//             cartVariant.product.productType === 'ADDONS'
//               ? total + cartVariant.product.price
//               : total;
//           return addonPrice;
//         },
//         0,
//       );

//       return (
//         totalValue +
//         (addonPrice + cartProduct.product.price) * cartProduct.quantity
//       );
//     }

//     return totalValue + cartProduct.product.price * cartProduct.quantity;
//   };

//   const totalAmount = cartProducts?.reduce(calculateAmount, 0);

//   const tax = (totalAmount / 1.12) * 0.12;
//   const subtotal = totalAmount - tax;
//   const hashId = `${uuid()}`.replace(/\-/g, '').replace(/\D+/g, '');
//   const order_id = hashId.substring(0, 5);

//   const [createOrder] = useCreateOrderWalkinMutation();

//   const handleAfterPrint = async () => {
//     try {
//       const res = await createOrder({
//         totalAmount,
//         order_id,
//         cartProducts: cartProducts,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//     setToggleCashier(false);
//     setInputMoney(0);
//   };

//   const handlePay = () => {
//     setToggleCashier(true);
//   };

//   return (
//     <CashierContentContainer>
//       {/* <ThermalPrinter ref={printerRef} /> */}

//       {toggleCashier && (
//         <PopupCashier
//           handlePrint={handlePrint}
//           inputMoney={inputMoney}
//           totalAmount={totalAmount}
//           setInputMoney={setInputMoney}
//           setToggleCashier={setToggleCashier}
//         />
//       )}
//       <h1>Current Order</h1>
//       <Orders>{content}</Orders>

//       <OrderSummary>
//         <Summary>
//           <Subtotal>Subtotal</Subtotal>
//           <SubtotalAmount>
//             {productPriceFormatter(subtotal + '')}
//           </SubtotalAmount>
//         </Summary>

//         <Summary>
//           <Tax>Tax</Tax>
//           <TaxAmount>{productPriceFormatter(tax + '')}</TaxAmount>
//         </Summary>

//         <Summary>
//           <Subtotal>Total</Subtotal>
//           <SubtotalAmount>
//             {productPriceFormatter(totalAmount + '')}
//           </SubtotalAmount>
//         </Summary>
//       </OrderSummary>

//       <PrintReceiptButton onClick={handlePay}> Pay Now</PrintReceiptButton>

//       <ReactToPrint
//         ref={printBtnRef}
//         onAfterPrint={handleAfterPrint}
//         // trigger={() => <PrintReceiptButton>Print Receipt</PrintReceiptButton>}
//         content={() => componentRef.current}
//       />

//       <div style={{display: 'none'}}>
//         <ReceiptContainer ref={componentRef}>
//           <ReceiptContent>
//             <ReceiptHeader>
//               <BranchName>Zsakers Cafe</BranchName>
//               <Address>RQQ4+MP7, Hagonoy Bulacan</Address>
//               <Contact> (+63 960 841 0594) </Contact>
//               <DateContent> {new Date().toLocaleString()} </DateContent>
//               <OrderId>
//                 OrderId: <span>{order_id}</span>
//               </OrderId>
//               <CashierInfo>
//                 Cashier Name:{' '}
//                 <span>
//                   {' '}
//                   {user?.profile.firstname} {user?.profile.lastname}{' '}
//                 </span>
//               </CashierInfo>
//             </ReceiptHeader>

//             <ReceiptBody>
//               {cartProducts?.map((cartProduct) => {
//                 return (
//                   <ReceiptProduct>
//                     <span>{cartProduct.product.productName}</span>
//                     <span>
//                       @ {cartProduct.product.price} x {cartProduct.quantity}
//                     </span>
//                     <span>
//                       {productPriceFormatter(
//                         cartProduct.product.price * cartProduct.quantity + '',
//                       )}
//                     </span>
//                   </ReceiptProduct>
//                 );
//               })}
//             </ReceiptBody>

//             <ReceiptFooter>
//               <SummaryContent>
//                 <div className='items-count'>Items Count: </div>
//                 <span>{cartProducts?.length}</span>
//               </SummaryContent>
//               <SummaryContent>
//                 <div className='sub-total'>Sub total: </div>{' '}
//                 <span>{productPriceFormatter(subtotal + '')}</span>
//               </SummaryContent>
//               <SummaryContent>
//                 <div className='sub-total'>Tax: </div>{' '}
//                 <span>{productPriceFormatter(tax + '')}</span>
//               </SummaryContent>
//               <SummaryContent>
//                 <div className='total-amount'>Total Amount: </div>{' '}
//                 <span>{productPriceFormatter(totalAmount + '')}</span>
//               </SummaryContent>
//               <SummaryContent>
//                 <div className='sub-total'>Cash: </div>{' '}
//                 <span>{inputMoney}</span>
//               </SummaryContent>
//               <SummaryContent>
//                 <div className='sub-total'>Change: </div>{' '}
//                 <span>
//                   {productPriceFormatter(
//                     (inputMoney - totalAmount).toFixed(2) + '',
//                   )}
//                 </span>
//               </SummaryContent>
//             </ReceiptFooter>

//             <h3>Thank you!</h3>
//           </ReceiptContent>
//         </ReceiptContainer>
//       </div>
//     </CashierContentContainer>
//   );
// }

// export default CashierContent;
