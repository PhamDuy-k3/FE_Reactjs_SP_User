import React, { useEffect, useState, useCallback, useRef } from "react";
import ComponentHeader from "../../components/header/header";
import Banner from "../../components/banner/banner";
import { Sale } from "../../components/sale/sale";
import Category from "../../components/category/category";
import Advertisements from "../../components/advertisements/advertisements";
import FlastSale from "../../components/flast-sale/flast_sale";
import ShopeeMaill from "../../components/shopee-maill/shopee-maill";
import Suggest from "../../components/suggest/suggest";
import Footer from "../../components/footer/footer";
import Advertisement from "../../components/advertisement/advertisement";
import Chat from "../../components/chat/chat";
import "./scssIndex/index.scss";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loading/loading";

const Index = () => {
  const [listProduct, setListProduct] = useState([]);
  const [limit, setLimit] = useState(6);
  const [listProduct2, setListProduct2] = useState([]);
  const [cookies, , removeCookies] = useCookies(["user_token"]);
  const [categorys, setCategorys] = useState([]);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(["home"]);
  const suggestRef = useRef(null);

  // Kiểm tra tính hợp lệ của token khi component được render lần đầu
  useEffect(() => {
    checkToken();
  }, []);

  // Hàm kiểm tra token
  const checkToken = async () => {
    try {
      const response = await fetch(`http://localhost:5050/auth/checkToken`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + cookies.user_token,
        },
      });
      if (!response.ok) {
        removeCookies("user_token", { path: "/" });
        setIsTokenValid(false);
        navigate("/login");
      } else {
        setIsTokenValid(true);
        await fetchCategories();
        await fetchUserProducts();
      }
    } catch (error) {
      console.error("Lỗi kiểm tra token:", error);
      setIsTokenValid(false); // Đặt trạng thái token không hợp lệ nếu có lỗi
    }
  };

  // Hàm gọi API lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5050/categories");
      if (response.ok) {
        const data = await response.json();
        setCategorys(data.data);
      } else {
        console.error("Error fetching categories:", response.status);
      }
    } catch (error) {
      console.error("Error fetching categories API:", error);
    }
  };

  // Hàm gọi API lấy danh sách sản phẩm giả lập
  const fetchProducts = async () => {
    try {
      const response = await fetch("https://dummyjson.com/products");
      if (response.ok) {
        const data = await response.json();
        setListProduct(data.products);
      } else {
        console.error("Error fetching products:", response.status);
      }
    } catch (error) {
      console.error("Error fetching products API:", error);
    }
  };

  // Hàm lấy danh sách sản phẩm của người dùng, phụ thuộc vào token
  const fetchUserProducts = useCallback(async () => {
    if (isTokenValid === false) return;
    try {
      const response = await fetch(
        `http://localhost:5050/products?&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.user_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setListProduct2(data.data);
        setIsLoading(false);
      } else {
        console.error("Error fetching user products:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user products API:", error);
    }
  }, [limit, cookies.user_token, isTokenValid]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchUserProducts();
  }, [fetchUserProducts]);

  const handleViewProduct = (count) => {
    setLimit(count);
    setIsLoading(true);
    if (count === 6) {
      setIsLoading(false);
      if (suggestRef.current) {
        window.scrollTo({
          top:
            suggestRef.current.getBoundingClientRect().top +
            window.scrollY -
            130,
        });
      }
    }
  };

  return (
    <>
      {isTokenValid === true && (
        <div className="box">
          <ComponentHeader />
          <Advertisement />
          <Chat />
          <section className="context">
            <section className="banner-sale">
              <Banner />
              <Sale />
            </section>
            <Category list={categorys} />
            <FlastSale list={listProduct} />
            <Advertisements />
            <ShopeeMaill list={listProduct} />
            <section ref={suggestRef} className="suggest">
              <div className="suggest-title text-align sticky-top">
                <h4>{t("suggest.today_suggestion")}</h4>
                <div className="gach"></div>
              </div>
              <div className="suggest-products d-flex flex-wrap">
                <Suggest list={listProduct2} />
              </div>
              {isLoading && <Loading />}
              <div className="see-more">
                {limit === 6 ? (
                  <button onClick={() => handleViewProduct(20)}>
                    {t("suggest.see_more")}
                  </button>
                ) : (
                  <button onClick={() => handleViewProduct(6)}>
                    {t("suggest.hide_less")}
                  </button>
                )}
              </div>
            </section>
          </section>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Index;
