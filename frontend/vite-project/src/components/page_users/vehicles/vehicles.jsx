import {useState, useEffect} from 'react'
import { Photos } from '../../../../photo';
import styles from './vehiclesSt.module.scss'
import axios from 'axios'; 


function Vehicles(){
    const [carAds, setCarAds] = useState([]);
    const [viewMode, setViewMode] = useState('list');
     const [data, setData] = useState([])

  

    const [proizvoditel, setProizvoditel] = useState({
    Opel: false,
    Nissan: false,
    Volkswagen: false,
    Renault: false,
    Volvo: false,    
    Audi: false,    
    BMW: false,     
    Iveco: false,   

});

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProizvoditel(prev => ({ ...prev, [name]: checked }));
    };

  useEffect(() => {
        const selected = Object.keys(proizvoditel).filter(key => proizvoditel[key]);

        const params = new URLSearchParams();
        params.append('queryName', 'proizvoditel_filter');
        if (selected.length > 0) {
            params.append('proizvoditel', selected.join(','));
        }

        axios.get(`http://localhost:3000/api/car?${params.toString()}`)
            .then(res => setData(res.data))
            .catch(console.error);
    }, [proizvoditel]);


    return(
        <>
            <section className={styles.vehiclesMain}>
                <div className={styles.vehiclesBlock}>

                    <div className={styles.trackBlock}>
                        <div className={styles.track}>
                        <p>Главная</p>
                        <p> > </p>
                        <p>Транспортные средства</p>
                    </div>

                    <div className={styles.list}>
                            <div className={styles.listLeft}>
                                <div className={styles.listBlock}>
                                    <p>- Цена, €</p>
        
                                    <div className={styles.priceList}>
                                        <div className={styles.priceText}>
                                            <p>От <span>1200</span></p>
                                        </div>
                                        
                                        <div className={styles.priceTextRight}>
                                            <p>До <span>152444</span></p>
                                        </div>                                    
                                    </div>
        
                                    <div>
                                        <div>
                                            <p>- Тип транспорта</p>
        
                                            <label htmlFor="car"></label>
                                            <input name='car' list='category-options' id='car' type="text" />
                                            <datalist id='category-options'>
                                                <option value="Грузовики" />
        
                                            </datalist>
                                        </div>                                    
                                    </div>

                                    
                                    <div className={styles.carList}>
                                        <div className={styles.carListBox}>
                                             <p>- Производитель</p>

                                             <label className={styles.checkboxList}>
                                                <input type="checkbox" name="Volvo" checked={proizvoditel.Volvo} onChange={handleCheckboxChange} />
                                                <p>Volvo</p>
                                            </label>

                                            <label className={styles.checkboxList}>
                                                <input type="checkbox" name="Audi" checked={proizvoditel.Audi} onChange={handleCheckboxChange} />
                                                <p>Audi</p>
                                            </label>
            
                                            <label className={styles.checkboxList}>
                                                <input type="checkbox" name="BMW" checked={proizvoditel.BMW} onChange={handleCheckboxChange} />
                                                <p>BMW</p>
                                            </label>
        
        
                                            <label className={styles.checkboxList}>
                                                <input type='checkbox' name="Volkswagen" checked={proizvoditel.Volkswagen} onChange={handleCheckboxChange}/> 
                                                <p>Volkswagen</p>
                                            </label>
        
                                            <label className={styles.checkboxList}>
                                                <input type='checkbox' name="Nissan" checked={proizvoditel.Nissan} onChange={handleCheckboxChange}/>
                                                <p>Nissan</p>
                                            </label>
                                            
                                        </div>
                                    </div>
        
                                     <div>
                                        <div>
                                            <p>- Страна местонахождения</p>
        
                                            <label htmlFor="car"></label>
                                            <input name='car' list='country-options' id='car' type="text" />
                                            <datalist id='country-options'>
                                                <option value="Франция; Италия " />
        
                                            </datalist>
                                        </div>                                    
                                    </div>
        
                                    <div className={styles.carList}>
                                        <div className={styles.carListBox}>
                                             <p>- Коробка передач</p>
        
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>Коробка автомат</p>
                                            </div>
        
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>Механика</p>
                                            </div>
                                           
                                            
                                        </div>
                                    </div>
        
                                    <div className={styles.carList}>
                                        <div className={styles.carListBox}>
                                             <p>- Продажа</p>
        
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>Аукцион</p>
                                            </div>
        
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>По запросу</p>
                                            </div>
        
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>Лизинг</p>
                                            </div>
                                            
                                            <div className={styles.checkboxList}>
                                                <input type='checkbox'/>
                                                <p>Сдется в аренду</p>
                                            </div>                                          
                                        </div>
                                    </div>
        
                                    <div>
                                        <button>применить</button>
                                    </div>
        
                                </div>
                            </div>
                        </div>
                    </div>
                    

            <div className={styles.columnCarBlock}>
                    <div className={styles.categoryCar}>
                        <div className={styles.categoryCard}>
                            <div className={styles.categoryType}>
                                <div>
                                    <p>Цена</p>
                                    <p>от 1200 до 152444 </p>
                                </div>

                                 <div>
                                    <p>Тип транспорта</p>
                                    <p>Грузовики </p>
                                </div>

                                <button>Очистить всё </button>
                            </div>
                        </div>
                    </div>

                    
               <div className={styles.carBlock}>
                        {data.map((item) => (
                            <div className={styles.card} key={item.id}>
                                <div className={styles.cardInner}>
                                    <div className={styles.imageWrapper}>
                                        <img src={item.img_car} alt="" />
                                    </div>
                                    <div className={styles.titleBlock}>
                                        <p className={styles.bodyType}>{item.body_type}</p>
                                        <p className={styles.n}>{item.name}</p>
                                    </div>
                                    <ul className={styles.specsList}>
                                        <li>{item.years_car}</li>
                                        <li>{item.size_car}</li>
                                        <li>{item.distance_traveled}</li>
                                    </ul>
                                    <div className={styles.footer}>
                                        <div className={styles.sellerInfo}>
                                            <div className={styles.locationIcon}>
                                                <img src={Photos.location} alt="location" />
                                                <div className={styles.sellerDetails}>
                                                    <p>{item.seller_name}</p>
                                                    <p>{item.seller_country}</p>
                                                </div>
                                            </div>
                                            <div className={styles.priceBlock}>
                                                <div className={styles.price}>
                                                    <p>
                                                        {item.price}
                                                        <span className={styles.currency}>€</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>                                        
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                    

                </div>
                
            </section>
        </>
    )
}

export default Vehicles 