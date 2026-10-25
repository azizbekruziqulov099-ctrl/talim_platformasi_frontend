// REV151: bog'cha darslari uchun rassom chizgan rasmlar (avtomatik ro'yxat). Kalit — «d_» + darsRasmMeta.js dagi id.
import { RASMLAR } from "./xonalar/rasmlar.js";
import { JR } from "./jonli/jonliRasm.js";
import d_apple_please from "./dars/rasm/apple-please.webp";
import d_basket from "./dars/rasm/basket.webp";
import d_bathroom from "./dars/rasm/bathroom.webp";
import d_be_quiet from "./dars/rasm/be-quiet.webp";
import d_bear from "./dars/rasm/bear.webp";
import d_big from "./dars/rasm/big.webp";
import d_black from "./dars/rasm/black.webp";
import d_blue from "./dars/rasm/blue.webp";
import d_brown from "./dars/rasm/brown.webp";
import d_bu_mening_akam_yoki_ukam from "./dars/rasm/bu_mening_akam_yoki_ukam.webp";
import d_bu_mening_dadam from "./dars/rasm/bu_mening_dadam.webp";
import d_bu_mening_onam from "./dars/rasm/bu_mening_onam.webp";
import d_bu_mening_opam_yoki_singlim from "./dars/rasm/bu_mening_opam_yoki_singlim.webp";
import d_can_clap from "./dars/rasm/can-clap.webp";
import d_can_i_help from "./dars/rasm/can-i-help.webp";
import d_can_jump from "./dars/rasm/can-jump.webp";
import d_can_you_swim from "./dars/rasm/can-you-swim.webp";
import d_cant_fly from "./dars/rasm/cant-fly.webp";
import d_clap_your_hands from "./dars/rasm/clap-your-hands.webp";
import d_climb from "./dars/rasm/climb.webp";
import d_close_book from "./dars/rasm/close-book.webp";
import d_crocodile from "./dars/rasm/crocodile.webp";
import d_dislike_onions from "./dars/rasm/dislike-onions.webp";
import d_dislike_rain from "./dars/rasm/dislike-rain.webp";
import d_dislike_spiders from "./dars/rasm/dislike-spiders.webp";
import d_do_you_like from "./dars/rasm/do-you-like.webp";
import d_do_st from "./dars/rasm/do_st.webp";
import d_elephant from "./dars/rasm/elephant.webp";
import d_family from "./dars/rasm/family.webp";
import d_farm from "./dars/rasm/farm.webp";
import d_favourite_colour from "./dars/rasm/favourite-colour.webp";
import d_favourite_plov from "./dars/rasm/favourite-plov.webp";
import d_fish_swim from "./dars/rasm/fish-swim.webp";
import d_five_bananas from "./dars/rasm/five-bananas.webp";
import d_fox from "./dars/rasm/fox.webp";
import d_from_uzbekistan from "./dars/rasm/from-uzbekistan.webp";
import d_futbolkam_qizil from "./dars/rasm/futbolkam_qizil.webp";
import d_garden from "./dars/rasm/garden.webp";
import d_giraffe from "./dars/rasm/giraffe.webp";
import d_go_by_bus from "./dars/rasm/go-by-bus.webp";
import d_goodbye_see_you from "./dars/rasm/goodbye-see-you.webp";
import d_green from "./dars/rasm/green.webp";
import d_grey from "./dars/rasm/grey.webp";
import d_have_ball from "./dars/rasm/have-ball.webp";
import d_have_cat from "./dars/rasm/have-cat.webp";
import d_have_dog from "./dars/rasm/have-dog.webp";
import d_have_sister from "./dars/rasm/have-sister.webp";
import d_he_is_doctor from "./dars/rasm/he-is-doctor.webp";
import d_hello from "./dars/rasm/hello.webp";
import d_help_me from "./dars/rasm/help-me.webp";
import d_here_you_are from "./dars/rasm/here-you-are.webp";
import d_how_are_you from "./dars/rasm/how-are-you.webp";
import d_how_go_school from "./dars/rasm/how-go-school.webp";
import d_how_many from "./dars/rasm/how-many.webp";
import d_how_many_bananas from "./dars/rasm/how-many-bananas.webp";
import d_i_am_big from "./dars/rasm/i-am-big.webp";
import d_i_am_five from "./dars/rasm/i-am-five.webp";
import d_i_like from "./dars/rasm/i-like.webp";
import d_i_walk from "./dars/rasm/i-walk.webp";
import d_im_fine from "./dars/rasm/im-fine.webp";
import d_im_thirsty from "./dars/rasm/im-thirsty.webp";
import d_in_box from "./dars/rasm/in-box.webp";
import d_its_a_ball from "./dars/rasm/its-a-ball.webp";
import d_kitchen from "./dars/rasm/kitchen.webp";
import d_kiy from "./dars/rasm/kiy.webp";
import d_lets_count from "./dars/rasm/lets-count.webp";
import d_lets_play from "./dars/rasm/lets-play.webp";
import d_like_apples from "./dars/rasm/like-apples.webp";
import d_like_cats from "./dars/rasm/like-cats.webp";
import d_like_ice_cream from "./dars/rasm/like-ice-cream.webp";
import d_lion from "./dars/rasm/lion.webp";
import d_living_room from "./dars/rasm/living-room.webp";
import d_love_mum from "./dars/rasm/love-mum.webp";
import d_mening_ismim_anvar from "./dars/rasm/mening_ismim_anvar.webp";
import d_money from "./dars/rasm/money.webp";
import d_monkey from "./dars/rasm/monkey.webp";
import d_my_name_is from "./dars/rasm/my-name-is.webp";
import d_my_name_is_2 from "./dars/rasm/my-name-is_2.webp";
import d_nice_to_meet from "./dars/rasm/nice-to-meet.webp";
import d_no from "./dars/rasm/no.webp";
import d_no_i_cant from "./dars/rasm/no-i-cant.webp";
import d_no_i_dont from "./dars/rasm/no-i-dont.webp";
import d_of_course from "./dars/rasm/of-course.webp";
import d_on_table from "./dars/rasm/on-table.webp";
import d_open_book from "./dars/rasm/open-book.webp";
import d_owl from "./dars/rasm/owl.webp";
import d_pink from "./dars/rasm/pink.webp";
import d_purple from "./dars/rasm/purple.webp";
import d_raise_hand from "./dars/rasm/raise-hand.webp";
import d_red from "./dars/rasm/red.webp";
import d_ride_bike from "./dars/rasm/ride-bike.webp";
import d_school from "./dars/rasm/school.webp";
import d_shapkangni_kiy from "./dars/rasm/shapkangni_kiy.webp";
import d_she_is_teacher from "./dars/rasm/she-is-teacher.webp";
import d_sit_down from "./dars/rasm/sit-down.webp";
import d_skate from "./dars/rasm/skate.webp";
import d_small from "./dars/rasm/small.webp";
import d_snake from "./dars/rasm/snake.webp";
import d_snake_cant_walk from "./dars/rasm/snake-cant-walk.webp";
import d_snowy from "./dars/rasm/snowy.webp";
import d_stamp_your_feet from "./dars/rasm/stamp-your-feet.webp";
import d_stand_up from "./dars/rasm/stand-up.webp";
import d_stop from "./dars/rasm/stop.webp";
import d_thank_you from "./dars/rasm/thank-you.webp";
import d_this_is_my from "./dars/rasm/this-is-my.webp";
import d_tiger from "./dars/rasm/tiger.webp";
import d_today_is from "./dars/rasm/today-is.webp";
import d_tomorrow from "./dars/rasm/tomorrow.webp";
import d_tuflim_ko_k from "./dars/rasm/tuflim_ko_k.webp";
import d_under_bed from "./dars/rasm/under-bed.webp";
import d_want_pilot from "./dars/rasm/want-pilot.webp";
import d_want_to_be from "./dars/rasm/want-to-be.webp";
import d_weather from "./dars/rasm/weather.webp";
import d_week from "./dars/rasm/week.webp";
import d_weekend from "./dars/rasm/weekend.webp";
import d_well_done from "./dars/rasm/well-done.webp";
import d_what_day from "./dars/rasm/what-day.webp";
import d_what_is_it from "./dars/rasm/what-is-it.webp";
import d_what_like from "./dars/rasm/what-like.webp";
import d_whats_your_name from "./dars/rasm/whats-your-name.webp";
import d_where_cat from "./dars/rasm/where-cat.webp";
import d_where_live from "./dars/rasm/where-live.webp";
import d_white from "./dars/rasm/white.webp";
import d_wolf from "./dars/rasm/wolf.webp";
import d_xursand from "./dars/rasm/xursand.webp";
import d_yes from "./dars/rasm/yes.webp";
import d_yes_i_can from "./dars/rasm/yes-i-can.webp";
import d_yes_i_do from "./dars/rasm/yes-i-do.webp";
import d_yummy from "./dars/rasm/yummy.webp";
import d_zebra from "./dars/rasm/zebra.webp";
import d_chest from "./dars/rasm/chest.webp";
import d_eat_fruit from "./dars/rasm/eat-fruit.webp";
import d_i_go_to_bed from "./dars/rasm/i-go-to-bed.webp";
import d_i_m_ready_for_school from "./dars/rasm/i-m-ready-for-school.webp";
import d_i_visited_my_granny from "./dars/rasm/i-visited-my-granny.webp";
import d_it_was_fun from "./dars/rasm/it-was-fun.webp";
import d_look_left_and_right from "./dars/rasm/look-left-and-right.webp";
import d_open_your_mouth from "./dars/rasm/open-your-mouth.webp";
import d_sababi from "./dars/rasm/sababi.webp";
import d_wash_your_hands_2 from "./dars/rasm/wash-your-hands-2.webp";
import d_astronavt from "./dars/rasm/astronavt.webp";
import d_atirgul from "./dars/rasm/atirgul.webp";
import d_axlat_qutisi from "./dars/rasm/axlat-qutisi.webp";
import d_baliqcha from "./dars/rasm/baliqcha.webp";
import d_behind_the_box from "./dars/rasm/behind-the-box.webp";
import d_birinchi from "./dars/rasm/birinchi.webp";
import d_bittani_ayirish from "./dars/rasm/bittani-ayirish.webp";
import d_black_and_white from "./dars/rasm/black-and-white.webp";
import d_burgut from "./dars/rasm/burgut.webp";
import d_buxoro_bug_usi from "./dars/rasm/buxoro-bug-usi.webp";
import d_buxoro from "./dars/rasm/buxoro.webp";
import d_chigirtka from "./dars/rasm/chigirtka.webp";
import d_chorak from "./dars/rasm/chorak.webp";
import d_g_ildirak from "./dars/rasm/g-ildirak.webp";
import d_go_sht from "./dars/rasm/go-sht.webp";
import d_ikkinchi from "./dars/rasm/ikkinchi.webp";
import d_ip_bilan_o_lchash from "./dars/rasm/ip-bilan-o-lchash.webp";
import d_javob from "./dars/rasm/javob.webp";
import d_kit_2 from "./dars/rasm/kit-2.webp";
import d_kit from "./dars/rasm/kit.webp";
import d_kulrang_echkemar from "./dars/rasm/kulrang-echkemar.webp";
import d_kurka from "./dars/rasm/kurka.webp";
import d_magnit from "./dars/rasm/magnit.webp";
import d_metroda from "./dars/rasm/metroda.webp";
import d_mo_yqalam from "./dars/rasm/mo-yqalam.webp";
import d_o_t_o_chirgich from "./dars/rasm/o-t-o-chirgich.webp";
import d_og_ir from "./dars/rasm/og-ir.webp";
import d_plastikni from "./dars/rasm/plastikni.webp";
import d_qo_tos from "./dars/rasm/qo-tos.webp";
import d_qor_qoploni from "./dars/rasm/qor-qoploni.webp";
import d_qovun from "./dars/rasm/qovun.webp";
import d_qushlarga_g_amxo_rlik from "./dars/rasm/qushlarga-g-amxo-rlik.webp";
import d_quyosh_nuri_2 from "./dars/rasm/quyosh-nuri-2.webp";
import d_quyosh_nuri from "./dars/rasm/quyosh-nuri.webp";
import d_rasmli_misol from "./dars/rasm/rasmli-misol.webp";
import d_shaftoli from "./dars/rasm/shaftoli.webp";
import d_soya from "./dars/rasm/soya.webp";
import d_tik_va_qiya_nur from "./dars/rasm/tik-va-qiya-nur.webp";
import d_til from "./dars/rasm/til.webp";
import d_tortiladi from "./dars/rasm/tortiladi.webp";
import d_tozalik from "./dars/rasm/tozalik.webp";
import d_tuman from "./dars/rasm/tuman.webp";
import d_uch from "./dars/rasm/uch.webp";
import d_uchinchi from "./dars/rasm/uchinchi.webp";
import d_urug_2 from "./dars/rasm/urug-2.webp";
import d_uya from "./dars/rasm/uya.webp";
import d_yer_2 from "./dars/rasm/yer-2.webp";
import d_yer from "./dars/rasm/yer.webp";
import d_yerning_qiyaligi from "./dars/rasm/yerning-qiyaligi.webp";
import d_yuk_mashinasi from "./dars/rasm/yuk-mashinasi.webp";
import d_101 from "./dars/rasm/101.webp";
import d_bir_soatda from "./dars/rasm/bir-soatda.webp";
import d_bugun from "./dars/rasm/bugun.webp";
import d_bulg_or_qalampiri from "./dars/rasm/bulg-or-qalampiri.webp";
import d_cheksiz from "./dars/rasm/cheksiz.webp";
import d_dumalaydigan_shakllar from "./dars/rasm/dumalaydigan-shakllar.webp";
import d_elektr from "./dars/rasm/elektr.webp";
import d_foydali_ovqat from "./dars/rasm/foydali-ovqat.webp";
import d_grafik_diktant from "./dars/rasm/grafik-diktant.webp";
import d_ikki_yuz_va_besh_yuz from "./dars/rasm/ikki-yuz-va-besh-yuz.webp";
import d_istirohat_bog_i from "./dars/rasm/istirohat-bog-i.webp";
import d_jun from "./dars/rasm/jun.webp";
import d_ko_zoynak from "./dars/rasm/ko-zoynak.webp";
import d_kompas from "./dars/rasm/kompas.webp";
import d_kuzatish from "./dars/rasm/kuzatish.webp";
import d_misoldan_masala from "./dars/rasm/misoldan-masala.webp";
import d_momaqaldiroq from "./dars/rasm/momaqaldiroq.webp";
import d_nafas_olish_va_chiqarish from "./dars/rasm/nafas-olish-va-chiqarish.webp";
import d_narx from "./dars/rasm/narx.webp";
import d_olti from "./dars/rasm/olti.webp";
import d_oqqush from "./dars/rasm/oqqush.webp";
import d_ovozini_baland_qilamiz from "./dars/rasm/ovozini-baland-qilamiz.webp";
import d_oxirgi from "./dars/rasm/oxirgi.webp";
import d_oy from "./dars/rasm/oy.webp";
import d_oziq_zanjiri from "./dars/rasm/oziq-zanjiri.webp";
import d_pashsha_va_mikroblar from "./dars/rasm/pashsha-va-mikroblar.webp";
import d_pastda from "./dars/rasm/pastda.webp";
import d_pingvin from "./dars/rasm/pingvin.webp";
import d_qadam from "./dars/rasm/qadam.webp";
import d_qator from "./dars/rasm/qator.webp";
import d_qayta_foydalanish_2 from "./dars/rasm/qayta-foydalanish-2.webp";
import d_qayta_ishlash from "./dars/rasm/qayta-ishlash.webp";
import d_qishki_uyqu from "./dars/rasm/qishki-uyqu.webp";
import d_qo_shiq from "./dars/rasm/qo-shiq.webp";
import d_qoldiq from "./dars/rasm/qoldiq.webp";
import d_qon from "./dars/rasm/qon.webp";
import d_qonuniyat from "./dars/rasm/qonuniyat.webp";
import d_qulf from "./dars/rasm/qulf.webp";
import d_qum_ostiga_yashirinadi from "./dars/rasm/qum-ostiga-yashirinadi.webp";
import d_sarg_ayadi from "./dars/rasm/sarg-ayadi.webp";
import d_sayyora from "./dars/rasm/sayyora.webp";
import d_tajriba from "./dars/rasm/tajriba.webp";
import d_temir_mixni from "./dars/rasm/temir-mixni.webp";
import d_to_qqiz from "./dars/rasm/to-qqiz.webp";
import d_yashil_rang from "./dars/rasm/yashil-rang.webp";
import d_yeb_qo_ydi from "./dars/rasm/yeb-qo-ydi.webp";
import d_yog_ochni from "./dars/rasm/yog-ochni.webp";
import d_yulduzli_osmon from "./dars/rasm/yulduzli-osmon.webp";
import d_yuz_so_mlik from "./dars/rasm/yuz-so-mlik.webp";
import d_yuzlab_yil from "./dars/rasm/yuzlab-yil.webp";
import d_cut from "./dars/rasm/cut.webp";
import d_i_get_up from "./dars/rasm/i-get-up.webp";
import d_i_went_to_the_park from "./dars/rasm/i-went-to-the-park.webp";
import d_the_cat_is_sleeping from "./dars/rasm/the-cat-is-sleeping.webp";
import d_what_did_you_do_yesterday from "./dars/rasm/what-did-you-do-yesterday.webp";
import d_what_s_the_matter from "./dars/rasm/what-s-the-matter.webp";
import d_where_is_the_park from "./dars/rasm/where-is-the-park.webp";
import d_1 from "./dars/rasm/1.webp";
import d_2 from "./dars/rasm/2.webp";
import d_6 from "./dars/rasm/6.webp";
import d_7 from "./dars/rasm/7.webp";
import d_akula from "./dars/rasm/akula.webp";
import d_bitta from "./dars/rasm/bitta.webp";
import d_burger from "./dars/rasm/burger.webp";
import d_diqqat from "./dars/rasm/diqqat.webp";
import d_do_konga_boramiz from "./dars/rasm/do-konga-boramiz.webp";
import d_dubulg_a from "./dars/rasm/dubulg-a.webp";
import d_hayvonlar_ovqatsiz_qoladi from "./dars/rasm/hayvonlar-ovqatsiz-qoladi.webp";
import d_hech_narsa_bo_lmaydi from "./dars/rasm/hech-narsa-bo-lmaydi.webp";
import d_ildiz_chiriydi from "./dars/rasm/ildiz-chiriydi.webp";
import d_juda_baland_ovozdan_saqlaymiz from "./dars/rasm/juda-baland-ovozdan-saqlaymiz.webp";
import d_kalit from "./dars/rasm/kalit.webp";
import d_kattalarni_chaqiramiz from "./dars/rasm/kattalarni-chaqiramiz.webp";
import d_ko_p_chips from "./dars/rasm/ko-p-chips.webp";
import d_ko_p_qavatli_uy from "./dars/rasm/ko-p-qavatli-uy.webp";
import d_kunduzi from "./dars/rasm/kunduzi.webp";
import d_mushtdek from "./dars/rasm/mushtdek.webp";
import d_ovlaymiz from "./dars/rasm/ovlaymiz.webp";
import d_qisqa_3 from "./dars/rasm/qisqa-3.webp";
import d_qo_rqitamiz from "./dars/rasm/qo-rqitamiz.webp";
import d_quvurlar_orqali from "./dars/rasm/quvurlar-orqali.webp";
import d_rasmga_olish from "./dars/rasm/rasmga-olish.webp";
import d_samokat from "./dars/rasm/samokat.webp";
import d_se from "./dars/rasm/se.webp";
import d_sinadi_yoki_to_kiladi from "./dars/rasm/sinadi-yoki-to-kiladi.webp";
import d_suv_qahramoni from "./dars/rasm/suv-qahramoni.webp";
import d_suzdi from "./dars/rasm/suzdi.webp";
import d_tepalik_ustida from "./dars/rasm/tepalik-ustida.webp";
import d_to_kib_yuboramiz from "./dars/rasm/to-kib-yuboramiz.webp";
import d_to_ntaramiz from "./dars/rasm/to-ntaramiz.webp";
import d_tuk_tuk from "./dars/rasm/tuk-tuk.webp";
import d_tuzdan from "./dars/rasm/tuzdan.webp";
import d_u1f314 from "./dars/rasm/u1f314.webp";
import d_u1f376 from "./dars/rasm/u1f376.webp";
import d_u1f48e from "./dars/rasm/u1f48e.webp";
import d_u1f54a from "./dars/rasm/u1f54a.webp";
import d_u1f91f from "./dars/rasm/u1f91f.webp";
import d_u1f9a9 from "./dars/rasm/u1f9a9.webp";
import d_zinapoya from "./dars/rasm/zinapoya.webp";
import d_favourite_green from "./dars/rasm/favourite-green.webp";
import d_have_pet from "./dars/rasm/have-pet.webp";
import d_hi from "./dars/rasm/hi.webp";
import d_how_old from "./dars/rasm/how-old.webp";
import d_like_football from "./dars/rasm/like-football.webp";
import d_live_samarkand from "./dars/rasm/live-samarkand.webp";
import d_see_you_soon from "./dars/rasm/see-you-soon.webp";
import d_this_is_me from "./dars/rasm/this-is-me.webp";
import d_yellow from "./dars/rasm/yellow.webp";
import d_belgi from "./dars/rasm/belgi.webp";
import d_eslab_qol from "./dars/rasm/eslab-qol.webp";
import d_har_safar_ikkitaga_ko_payadi from "./dars/rasm/har-safar-ikkitaga-ko-payadi.webp";
import d_natijasi from "./dars/rasm/natijasi.webp";
import d_navbat from "./dars/rasm/navbat.webp";
import d_sabab from "./dars/rasm/sabab.webp";
import d_tashqarida from "./dars/rasm/tashqarida.webp";
import d_tunda from "./dars/rasm/tunda.webp";
import d_uy_hayvoni from "./dars/rasm/uy-hayvoni.webp";
import d_uyning_ichida from "./dars/rasm/uyning-ichida.webp";
import d_ali_and_i_made_it from "./dars/rasm/ali-and-i-made-it.webp";
import d_goal_hooray_well_done from "./dars/rasm/goal-hooray-well-done.webp";
import d_here_is_the_money_thank from "./dars/rasm/here-is-the-money-thank.webp";
import d_here_is_your_medicine_drink from "./dars/rasm/here-is-your-medicine-drink.webp";
import d_hi_can_you_play_football from "./dars/rasm/hi-can-you-play-football.webp";
import d_i_like_football_my_favourite from "./dars/rasm/i-like-football-my-favourite.webp";
import d_oh_no_my_shoe_can from "./dars/rasm/oh-no-my-shoe-can.webp";
import d_the_zoo_is_next_to from "./dars/rasm/the-zoo-is-next-to.webp";
import d_three_stops_here_is_the from "./dars/rasm/three-stops-here-is-the.webp";
import d_and_eat_fruit_get_well from "./dars/rasm/and-eat-fruit-get-well.webp";
import d_baliq_va_dengiz from "./dars/rasm/baliq-va-dengiz.webp";
import d_har_xil from "./dars/rasm/har-xil.webp";
import d_i_m_ready_i_go from "./dars/rasm/i-m-ready-i-go.webp";
import d_i_visited_my_granny_we from "./dars/rasm/i-visited-my-granny-we.webp";
import d_qisqa from "./dars/rasm/qisqa.webp";
import d_savatdan_tashqarida from "./dars/rasm/savatdan-tashqarida.webp";
import d_thank_you_very_much_goodbye from "./dars/rasm/thank-you-very-much-goodbye.webp";
import d_turn_left_at_the_bakery from "./dars/rasm/turn-left-at-the-bakery.webp";
import d_umumiy_belgi from "./dars/rasm/umumiy-belgi.webp";
import d_behind from "./dars/rasm/behind.webp";
import d_i_go_to_school from "./dars/rasm/i-go-to-school.webp";
import d_in_front_of from "./dars/rasm/in-front-of.webp";
import d_next_to from "./dars/rasm/next-to.webp";
import d_she_is_kind from "./dars/rasm/she-is-kind.webp";
import d_she_is_lazy from "./dars/rasm/she-is-lazy.webp";
import d_the_birds_are_singing from "./dars/rasm/the-birds-are-singing.webp";
import d_the_dog_is_running from "./dars/rasm/the-dog-is-running.webp";
import d_what_time_is_it from "./dars/rasm/what-time-is-it.webp";
import d_angry_child from "./dars/rasm/angry-child.webp";
import d_baby_chick_front_view from "./dars/rasm/baby-chick-front-view.webp";
import d_bar_of_soap_with from "./dars/rasm/bar-of-soap-with.webp";
import d_blue_square_shape from "./dars/rasm/blue-square-shape.webp";
import d_bowl_of_vegetable_salad from "./dars/rasm/bowl-of-vegetable-salad.webp";
import d_bowl_with_spoon from "./dars/rasm/bowl-with-spoon.webp";
import d_boy_raising_hand_my from "./dars/rasm/boy-raising-hand-my.webp";
import d_bus_stop from "./dars/rasm/bus-stop.webp";
import d_calendar from "./dars/rasm/calendar.webp";
import d_chestnut_seed from "./dars/rasm/chestnut-seed.webp";
import d_child_bowing_to_say from "./dars/rasm/child-bowing-to-say.webp";
import d_child_calling_for_help from "./dars/rasm/child-calling-for-help.webp";
import d_child_crossing_arms_saying from "./dars/rasm/child-crossing-arms-saying.webp";
import d_child_with_headache_bandage from "./dars/rasm/child-with-headache-bandage.webp";
import d_child_with_stomachache from "./dars/rasm/child-with-stomachache.webp";
import d_city_skyline_tashkent from "./dars/rasm/city-skyline-tashkent.webp";
import d_clock_showing_half_past from "./dars/rasm/clock-showing-half-past.webp";
import d_clock_showing_seven_o from "./dars/rasm/clock-showing-seven-o.webp";
import d_daisy_flower from "./dars/rasm/daisy-flower.webp";
import d_family_b from "./dars/rasm/family-b.webp";
import d_fork_and_knife from "./dars/rasm/fork-and-knife.webp";
import d_get_well_soon_card from "./dars/rasm/get-well-soon-card.webp";
import d_honeybee from "./dars/rasm/honeybee.webp";
import d_ice_cube from "./dars/rasm/ice-cube.webp";
import d_ladybug from "./dars/rasm/ladybug.webp";
import d_medicine_pills from "./dars/rasm/medicine-pills.webp";
import d_number_ten from "./dars/rasm/number-ten.webp";
import d_nurse from "./dars/rasm/nurse.webp";
import d_orange_color_circle from "./dars/rasm/orange-color-circle.webp";
import d_party_celebration_with_confetti from "./dars/rasm/party-celebration-with-confetti.webp";
import d_pear from "./dars/rasm/pear.webp";
import d_pedestrian_crossing_with_children from "./dars/rasm/pedestrian-crossing-with-children.webp";
import d_pine_forest from "./dars/rasm/pine-forest.webp";
import d_red_triangle_shape from "./dars/rasm/red-triangle-shape.webp";
import d_sad_child_saying_sorry from "./dars/rasm/sad-child-saying-sorry.webp";
import d_sea_waves from "./dars/rasm/sea-waves.webp";
import d_sick_child_with_thermometer from "./dars/rasm/sick-child-with-thermometer.webp";
import d_sleeping_child_in_bed from "./dars/rasm/sleeping-child-in-bed.webp";
import d_small_sprout from "./dars/rasm/small-sprout.webp";
import d_spoon from "./dars/rasm/spoon.webp";
import d_stack_of_books_library from "./dars/rasm/stack-of-books-library.webp";
import d_teapot from "./dars/rasm/teapot.webp";
import d_tear_off_calendar from "./dars/rasm/tear-off-calendar.webp";
import d_thermometer from "./dars/rasm/thermometer.webp";
import d_toothbrush_with_toothpaste from "./dars/rasm/toothbrush-with-toothpaste.webp";
import d_turnip_with_green_leaves from "./dars/rasm/turnip-with-green-leaves.webp";
import d_two_friends_holding_hands from "./dars/rasm/two-friends-holding-hands.webp";
import d_uzbek_flatbread_bakery from "./dars/rasm/uzbek-flatbread-bakery.webp";
import d_watermelon from "./dars/rasm/watermelon.webp";
import d_wrist_watch from "./dars/rasm/wrist-watch.webp";
import d_ant from "./dars/rasm/ant.webp";
import d_baby_chick_side_view from "./dars/rasm/baby-chick-side-view.webp";
import d_bactrian_camel from "./dars/rasm/bactrian-camel.webp";
import d_balance_scales from "./dars/rasm/balance-scales.webp";
import d_bone from "./dars/rasm/bone.webp";
import d_brain from "./dars/rasm/brain.webp";
import d_brown_soil from "./dars/rasm/brown-soil.webp";
import d_butterfly from "./dars/rasm/butterfly.webp";
import d_campfire from "./dars/rasm/campfire.webp";
import d_caterpillar from "./dars/rasm/caterpillar.webp";
import d_cherries from "./dars/rasm/cherries.webp";
import d_clock_showing_eight_o from "./dars/rasm/clock-showing-eight-o.webp";
import d_clock_showing_twelve_o from "./dars/rasm/clock-showing-twelve-o.webp";
import d_cup_of_hot_tea from "./dars/rasm/cup-of-hot-tea.webp";
import d_desert_with_dunes from "./dars/rasm/desert-with-dunes.webp";
import d_diploma_scroll from "./dars/rasm/diploma-scroll.webp";
import d_dolphin from "./dars/rasm/dolphin.webp";
import d_doughnut from "./dars/rasm/doughnut.webp";
import d_factory_with_smoke from "./dars/rasm/factory-with-smoke.webp";
import d_feather from "./dars/rasm/feather.webp";
import d_goat from "./dars/rasm/goat.webp";
import d_graduation_cap from "./dars/rasm/graduation-cap.webp";
import d_green_herb_plant from "./dars/rasm/green-herb-plant.webp";
import d_green_leaf from "./dars/rasm/green-leaf.webp";
import d_happy_child_with_party from "./dars/rasm/happy-child-with-party.webp";
import d_kneeling_child from "./dars/rasm/kneeling-child.webp";
import d_knife_cutting from "./dars/rasm/knife-cutting.webp";
import d_map from "./dars/rasm/map.webp";
import d_mobile_phone from "./dars/rasm/mobile-phone.webp";
import d_monkey_covering_eyes from "./dars/rasm/monkey-covering-eyes.webp";
import d_net_spider_web from "./dars/rasm/net-spider-web.webp";
import d_notebook from "./dars/rasm/notebook.webp";
import d_octopus from "./dars/rasm/octopus.webp";
import d_onion from "./dars/rasm/onion.webp";
import d_potted_plant from "./dars/rasm/potted-plant.webp";
import d_red_square_shape from "./dars/rasm/red-square-shape.webp";
import d_river_landscape from "./dars/rasm/river-landscape.webp";
import d_rock_stone from "./dars/rasm/rock-stone.webp";
import d_rocket from "./dars/rasm/rocket.webp";
import d_snowy_mountains from "./dars/rasm/snowy-mountains.webp";
import d_steam_rising from "./dars/rasm/steam-rising.webp";
import d_stethoscope from "./dars/rasm/stethoscope.webp";
import d_sun_hat from "./dars/rasm/sun-hat.webp";
import d_sunflower from "./dars/rasm/sunflower.webp";
import d_tooth from "./dars/rasm/tooth.webp";
import d_turtle from "./dars/rasm/turtle.webp";
import d_water_splash_puddle from "./dars/rasm/water-splash-puddle.webp";
import d_water_tap_with_drinking from "./dars/rasm/water-tap-with-drinking.webp";
import d_wheat_ears from "./dars/rasm/wheat-ears.webp";
import d_yawning_lazy_child_on from "./dars/rasm/yawning-lazy-child-on.webp";
import d_artist_with_palette from "./dars/rasm/artist-with-palette.webp";
import d_autumn_leaf from "./dars/rasm/autumn-leaf.webp";
import d_beating_heart from "./dars/rasm/beating-heart.webp";
import d_blue_book from "./dars/rasm/blue-book.webp";
import d_chick_hatching_from_egg from "./dars/rasm/chick-hatching-from-egg.webp";
import d_city_at_dusk from "./dars/rasm/city-at-dusk.webp";
import d_clock_face from "./dars/rasm/clock-face.webp";
import d_down_triangle from "./dars/rasm/down-triangle.webp";
import d_electric_plug from "./dars/rasm/electric-plug.webp";
import d_glass_bottle from "./dars/rasm/glass-bottle.webp";
import d_glass_jar from "./dars/rasm/glass-jar.webp";
import d_green_square from "./dars/rasm/green-square.webp";
import d_growth_chart from "./dars/rasm/growth-chart.webp";
import d_half_moon from "./dars/rasm/half-moon.webp";
import d_hedgehog from "./dars/rasm/hedgehog.webp";
import d_honey_pot from "./dars/rasm/honey-pot.webp";
import d_khiva_fortress from "./dars/rasm/khiva-fortress.webp";
import d_lollipop from "./dars/rasm/lollipop.webp";
import d_london_bridge from "./dars/rasm/london-bridge.webp";
import d_lungs from "./dars/rasm/lungs.webp";
import d_neighborhood_houses from "./dars/rasm/neighborhood-houses.webp";
import d_newspaper from "./dars/rasm/newspaper.webp";
import d_night_sky_over_houses from "./dars/rasm/night-sky-over-houses.webp";
import d_oval_ball from "./dars/rasm/oval-ball.webp";
import d_paw_prints from "./dars/rasm/paw-prints.webp";
import d_playground_slide from "./dars/rasm/playground-slide.webp";
import d_railway_track from "./dars/rasm/railway-track.webp";
import d_ribbon_bow from "./dars/rasm/ribbon-bow.webp";
import d_rooster from "./dars/rasm/rooster.webp";
import d_sheet_of_paper from "./dars/rasm/sheet-of-paper.webp";
import d_shopping_list from "./dars/rasm/shopping-list.webp";
import d_shower from "./dars/rasm/shower.webp";
import d_sled from "./dars/rasm/sled.webp";
import d_snowman from "./dars/rasm/snowman.webp";
import d_spinning_swirl from "./dars/rasm/spinning-swirl.webp";
import d_squirrel from "./dars/rasm/squirrel.webp";
import d_stopwatch from "./dars/rasm/stopwatch.webp";
import d_sun_behind_cloud from "./dars/rasm/sun-behind-cloud.webp";
import d_telephone_receiver from "./dars/rasm/telephone-receiver.webp";
import d_telescope from "./dars/rasm/telescope.webp";
import d_tent from "./dars/rasm/tent.webp";
import d_tin_can_cylinder from "./dars/rasm/tin-can-cylinder.webp";
import d_triangle_ruler from "./dars/rasm/triangle-ruler.webp";
import d_waffle from "./dars/rasm/waffle.webp";
import d_white_square from "./dars/rasm/white-square.webp";
import d_wilted_flower from "./dars/rasm/wilted-flower.webp";
import d_wind_gust from "./dars/rasm/wind-gust.webp";
import d_yellow_square from "./dars/rasm/yellow-square.webp";
import d_sahna_how_many_eggs from "./dars/rasm/sahna-how-many-eggs.webp";
import d_sahna_i_do_my_homework from "./dars/rasm/sahna-i-do-my-homework.webp";
import d_sahna_go_straight_then_turn from "./dars/rasm/sahna-go-straight-then-turn.webp";
import d_sahna_salom_doktor from "./dars/rasm/sahna-salom-doktor.webp";
// REV169: rassomning yangi 700 ta rasmi (m-… — o'zbekcha ma'nosi bo'yicha)
import d_m_ajoyib_zor from "./dars/rasm/m-ajoyib-zor.webp";
import d_m_alo from "./dars/rasm/m-alo.webp";
import d_m_amaki_toga from "./dars/rasm/m-amaki-toga.webp";
import d_m_assalomu_alaykum from "./dars/rasm/m-assalomu-alaykum.webp";
import d_m_bayram from "./dars/rasm/m-bayram.webp";
import d_m_bayramingiz_bilan from "./dars/rasm/m-bayramingiz-bilan.webp";
import d_m_bayramingiz_muborak from "./dars/rasm/m-bayramingiz-muborak.webp";
import d_m_besh from "./dars/rasm/m-besh.webp";
import d_m_bir from "./dars/rasm/m-bir.webp";
import d_m_bolalar from "./dars/rasm/m-bolalar.webp";
import d_m_boshqotirma_pazl from "./dars/rasm/m-boshqotirma-pazl.webp";
import d_m_bu_kim from "./dars/rasm/m-bu-kim.webp";
import d_m_bu_qanday_rang from "./dars/rasm/m-bu-qanday-rang.webp";
import d_m_bu_qanday_rangda from "./dars/rasm/m-bu-qanday-rangda.webp";
import d_m_bu from "./dars/rasm/m-bu.webp";
import d_m_chiroyli from "./dars/rasm/m-chiroyli.webp";
import d_m_depsin from "./dars/rasm/m-depsin.webp";
import d_m_dugona_dost from "./dars/rasm/m-dugona-dost.webp";
import d_m_eng_sevimli from "./dars/rasm/m-eng-sevimli.webp";
import d_m_ertagacha from "./dars/rasm/m-ertagacha.webp";
import d_m_hammasi_joyida_xop from "./dars/rasm/m-hammasi-joyida-xop.webp";
import d_m_havorang from "./dars/rasm/m-havorang.webp";
import d_m_hayvon from "./dars/rasm/m-hayvon.webp";
import d_m_hayvonot_bogi from "./dars/rasm/m-hayvonot-bogi.webp";
import d_m_ich from "./dars/rasm/m-ich.webp";
import d_m_ichmoq from "./dars/rasm/m-ichmoq.webp";
import d_m_ikki from "./dars/rasm/m-ikki.webp";
import d_m_iltimos from "./dars/rasm/m-iltimos.webp";
import d_m_ism from "./dars/rasm/m-ism.webp";
import d_m_janob from "./dars/rasm/m-janob.webp";
import d_m_juda_ham from "./dars/rasm/m-juda-ham.webp";
import d_m_juda_kop from "./dars/rasm/m-juda-kop.webp";
import d_m_juda_yaxshi from "./dars/rasm/m-juda-yaxshi.webp";
import d_m_juda from "./dars/rasm/m-juda.webp";
import d_m_katta_baland from "./dars/rasm/m-katta-baland.webp";
import d_m_kechirasan from "./dars/rasm/m-kechirasan.webp";
import d_m_kichkina from "./dars/rasm/m-kichkina.webp";
import d_m_korishguncha from "./dars/rasm/m-korishguncha.webp";
import d_m_korsat from "./dars/rasm/m-korsat.webp";
import d_m_ma_ol from "./dars/rasm/m-ma-ol.webp";
import d_m_mana_ol from "./dars/rasm/m-mana-ol.webp";
import d_m_mayli_hechqisi_yoq from "./dars/rasm/m-mayli-hechqisi-yoq.webp";
import d_m_mayli_xop from "./dars/rasm/m-mayli-xop.webp";
import d_m_men_ham from "./dars/rasm/m-men-ham.webp";
import d_m_men_ichaman from "./dars/rasm/m-men-ichaman.webp";
import d_m_men_man from "./dars/rasm/m-men-man.webp";
import d_m_men_seni_yaxshi_koraman from "./dars/rasm/m-men-seni-yaxshi-koraman.webp";
import d_m_men_xohlayman from "./dars/rasm/m-men-xohlayman.webp";
import d_m_men_yaxshi_koraman_yoqtiraman from "./dars/rasm/m-men-yaxshi-koraman-yoqtiraman.webp";
import d_m_men_yetti_yoshdaman from "./dars/rasm/m-men-yetti-yoshdaman.webp";
import d_m_men_yoqtiraman from "./dars/rasm/m-men-yoqtiraman.webp";
import d_m_men_yoqtirmayman from "./dars/rasm/m-men-yoqtirmayman.webp";
import d_m_men from "./dars/rasm/m-men.webp";
import d_m_menda_bor from "./dars/rasm/m-menda-bor.webp";
import d_m_menga_yoqadi from "./dars/rasm/m-menga-yoqadi.webp";
import d_m_menga_yoqmaydi from "./dars/rasm/m-menga-yoqmaydi.webp";
import d_m_mening_sevimli_rangim from "./dars/rasm/m-mening-sevimli-rangim.webp";
import d_m_meva from "./dars/rasm/m-meva.webp";
import d_m_mo_o from "./dars/rasm/m-mo-o.webp";
import d_m_mo from "./dars/rasm/m-mo.webp";
import d_m_olti from "./dars/rasm/m-olti.webp";
import d_m_on from "./dars/rasm/m-on.webp";
import d_m_osh_palov from "./dars/rasm/m-osh-palov.webp";
import d_m_osmon from "./dars/rasm/m-osmon.webp";
import d_m_oyinchoq from "./dars/rasm/m-oyinchoq.webp";
import d_m_oynaymiz from "./dars/rasm/m-oynaymiz.webp";
import d_m_ozingchi from "./dars/rasm/m-ozingchi.webp";
import d_m_ozingniki_chi from "./dars/rasm/m-ozingniki-chi.webp";
import d_m_piknik_sayr from "./dars/rasm/m-piknik-sayr.webp";
import d_m_pirildoq_zirillagich from "./dars/rasm/m-pirildoq-zirillagich.webp";
import d_m_qanday_chiroyli from "./dars/rasm/m-qanday-chiroyli.webp";
import d_m_qanday_mazali from "./dars/rasm/m-qanday-mazali.webp";
import d_m_qanday_rang from "./dars/rasm/m-qanday-rang.webp";
import d_m_qanday_rangda from "./dars/rasm/m-qanday-rangda.webp";
import d_m_qanday_yaxshi from "./dars/rasm/m-qanday-yaxshi.webp";
import d_m_qol_silkit_salomlash from "./dars/rasm/m-qol-silkit-salomlash.webp";
import d_m_sakkiz from "./dars/rasm/m-sakkiz.webp";
import d_m_sakra from "./dars/rasm/m-sakra.webp";
import d_m_sanaymiz from "./dars/rasm/m-sanaymiz.webp";
import d_m_sen_chi from "./dars/rasm/m-sen-chi.webp";
import d_m_seni_yaxshi_koraman from "./dars/rasm/m-seni-yaxshi-koraman.webp";
import d_m_sening_navbating from "./dars/rasm/m-sening-navbating.webp";
import d_m_seningchi from "./dars/rasm/m-seningchi.webp";
import d_m_sevimli_rang from "./dars/rasm/m-sevimli-rang.webp";
import d_m_sham from "./dars/rasm/m-sham.webp";
import d_m_silkit from "./dars/rasm/m-silkit.webp";
import d_m_sinf_bolalar from "./dars/rasm/m-sinf-bolalar.webp";
import d_m_ana_u_yerda from "./dars/rasm/m-ana-u-yerda.webp";
import d_m_asalari from "./dars/rasm/m-asalari.webp";
import d_m_baliq from "./dars/rasm/m-baliq.webp";
import d_m_bayram_ziyofat from "./dars/rasm/m-bayram-ziyofat.webp";
import d_m_berib_turasanmi from "./dars/rasm/m-berib-turasanmi.webp";
import d_m_berkinmachoq from "./dars/rasm/m-berkinmachoq.webp";
import d_m_bog_park from "./dars/rasm/m-bog-park.webp";
import d_m_boyamoq from "./dars/rasm/m-boyamoq.webp";
import d_m_bu_yerda from "./dars/rasm/m-bu-yerda.webp";
import d_m_bugun from "./dars/rasm/m-bugun.webp";
import d_m_chanqagan from "./dars/rasm/m-chanqagan.webp";
import d_m_charchadi_charchadim from "./dars/rasm/m-charchadi-charchadim.webp";
import d_m_charchagan from "./dars/rasm/m-charchagan.webp";
import d_m_chiroyli_gozal from "./dars/rasm/m-chiroyli-gozal.webp";
import d_m_chizmoq from "./dars/rasm/m-chizmoq.webp";
import d_m_chorshanba from "./dars/rasm/m-chorshanba.webp";
import d_m_divan from "./dars/rasm/m-divan.webp";
import d_m_doppi from "./dars/rasm/m-doppi.webp";
import d_m_dushanba from "./dars/rasm/m-dushanba.webp";
import d_m_emas from "./dars/rasm/m-emas.webp";
import d_m_gilam from "./dars/rasm/m-gilam.webp";
import d_m_goz from "./dars/rasm/m-goz.webp";
import d_m_hammom_vanna_xonasi from "./dars/rasm/m-hammom-vanna-xonasi.webp";
import d_m_hayron_ajablangan from "./dars/rasm/m-hayron-ajablangan.webp";
import d_m_ichida_da_2 from "./dars/rasm/m-ichida-da-2.webp";
import d_m_ichida_da from "./dars/rasm/m-ichida-da.webp";
import d_m_ikkinchi from "./dars/rasm/m-ikkinchi.webp";
import d_m_ilib_olish from "./dars/rasm/m-ilib-olish.webp";
import d_m_ilib_olmoq from "./dars/rasm/m-ilib-olmoq.webp";
import d_m_iliq from "./dars/rasm/m-iliq.webp";
import d_m_jahldor from "./dars/rasm/m-jahldor.webp";
import d_m_jahli_chiqqan from "./dars/rasm/m-jahli-chiqqan.webp";
import d_m_javon from "./dars/rasm/m-javon.webp";
import d_m_juma from "./dars/rasm/m-juma.webp";
import d_m_kalit from "./dars/rasm/m-kalit.webp";
import d_m_kasal from "./dars/rasm/m-kasal.webp";
import d_m_kiyim_kechak from "./dars/rasm/m-kiyim-kechak.webp";
import d_m_kiyim from "./dars/rasm/m-kiyim.webp";
import d_m_kiyimlar from "./dars/rasm/m-kiyimlar.webp";
import d_m_kiymoq from "./dars/rasm/m-kiymoq.webp";
import d_m_kompyuter from "./dars/rasm/m-kompyuter.webp";
import d_m_konsert from "./dars/rasm/m-konsert.webp";
import d_m_kop from "./dars/rasm/m-kop.webp";
import d_m_korkam_chiroyli from "./dars/rasm/m-korkam-chiroyli.webp";
import d_m_koylak from "./dars/rasm/m-koylak.webp";
import d_m_kulish from "./dars/rasm/m-kulish.webp";
import d_m_kulmoq from "./dars/rasm/m-kulmoq.webp";
import d_m_kulyapti from "./dars/rasm/m-kulyapti.webp";
import d_m_kun from "./dars/rasm/m-kun.webp";
import d_m_kutilmagan_sovga_syurpriz from "./dars/rasm/m-kutilmagan-sovga-syurpriz.webp";
import d_m_mana_bu_yerda from "./dars/rasm/m-mana-bu-yerda.webp";
import d_m_mehmonlar from "./dars/rasm/m-mehmonlar.webp";
import d_m_men_izlayapman from "./dars/rasm/m-men-izlayapman.webp";
import d_m_men_kiyganman_ustimda from "./dars/rasm/m-men-kiyganman-ustimda.webp";
import d_m_men_qidiryapman from "./dars/rasm/m-men-qidiryapman.webp";
import d_m_men_qila_olaman from "./dars/rasm/m-men-qila-olaman.webp";
import d_m_soch from "./dars/rasm/m-soch.webp";
import d_m_son_raqam from "./dars/rasm/m-son-raqam.webp";
import d_m_sovga from "./dars/rasm/m-sovga.webp";
import d_m_sumalak from "./dars/rasm/m-sumalak.webp";
import d_m_surat_foto from "./dars/rasm/m-surat-foto.webp";
import d_m_surat_fotosurat from "./dars/rasm/m-surat-fotosurat.webp";
import d_m_teg_ushla from "./dars/rasm/m-teg-ushla.webp";
import d_m_tegin_ushla from "./dars/rasm/m-tegin-ushla.webp";
import d_m_tishlar from "./dars/rasm/m-tishlar.webp";
import d_m_toq_sariq from "./dars/rasm/m-toq-sariq.webp";
import d_m_toqqiz from "./dars/rasm/m-toqqiz.webp";
import d_m_tort from "./dars/rasm/m-tort.webp";
import d_m_tugilgan_kuning_bilan from "./dars/rasm/m-tugilgan-kuning-bilan.webp";
import d_m_u from "./dars/rasm/m-u.webp";
import d_m_uch from "./dars/rasm/m-uch.webp";
import d_m_unchamas_ortacha from "./dars/rasm/m-unchamas-ortacha.webp";
import d_m_ura from "./dars/rasm/m-ura.webp";
import d_m_ustoz from "./dars/rasm/m-ustoz.webp";
import d_m_voy_voy_ajabo from "./dars/rasm/m-voy-voy-ajabo.webp";
import d_m_voy_zor from "./dars/rasm/m-voy-zor.webp";
import d_m_xayr from "./dars/rasm/m-xayr.webp";
import d_m_xayrli_kech from "./dars/rasm/m-xayrli-kech.webp";
import d_m_xayrli_kun from "./dars/rasm/m-xayrli-kun.webp";
import d_m_xonim from "./dars/rasm/m-xonim.webp";
import d_m_yangi from "./dars/rasm/m-yangi.webp";
import d_m_yaxshi from "./dars/rasm/m-yaxshi.webp";
import d_m_ye from "./dars/rasm/m-ye.webp";
import d_m_yemoq from "./dars/rasm/m-yemoq.webp";
import d_m_yetti from "./dars/rasm/m-yetti.webp";
import d_m_yop_yum from "./dars/rasm/m-yop-yum.webp";
import d_m_yoqtirmayman from "./dars/rasm/m-yoqtirmayman.webp";
import d_m_yulduz from "./dars/rasm/m-yulduz.webp";
import d_m_yum_yop from "./dars/rasm/m-yum-yop.webp";
import d_m_zor_ajoyib from "./dars/rasm/m-zor-ajoyib.webp";
import d_m_men_olaman from "./dars/rasm/m-men-olaman.webp";
import d_m_men_olmayman from "./dars/rasm/m-men-olmayman.webp";
import d_m_men_qila_olmayman from "./dars/rasm/m-men-qila-olmayman.webp";
import d_m_men_qorqaman from "./dars/rasm/m-men-qorqaman.webp";
import d_m_menga_ber from "./dars/rasm/m-menga-ber.webp";
import d_m_menga_berib_tur from "./dars/rasm/m-menga-berib-tur.webp";
import d_m_menga_yordam_ber from "./dars/rasm/m-menga-yordam-ber.webp";
import d_m_menga from "./dars/rasm/m-menga.webp";
import d_m_mushukcha from "./dars/rasm/m-mushukcha.webp";
import d_m_ob_havo from "./dars/rasm/m-ob-havo.webp";
import d_m_ochirgich from "./dars/rasm/m-ochirgich.webp";
import d_m_ogriyapti from "./dars/rasm/m-ogriyapti.webp";
import d_m_on_besh from "./dars/rasm/m-on-besh.webp";
import d_m_on_bir from "./dars/rasm/m-on-bir.webp";
import d_m_on_ikki from "./dars/rasm/m-on-ikki.webp";
import d_m_on_olti from "./dars/rasm/m-on-olti.webp";
import d_m_on_sakkiz from "./dars/rasm/m-on-sakkiz.webp";
import d_m_on_toqqiz from "./dars/rasm/m-on-toqqiz.webp";
import d_m_on_tort from "./dars/rasm/m-on-tort.webp";
import d_m_on_uch from "./dars/rasm/m-on-uch.webp";
import d_m_on_yetti from "./dars/rasm/m-on-yetti.webp";
import d_m_oqi from "./dars/rasm/m-oqi.webp";
import d_m_oquvchi from "./dars/rasm/m-oquvchi.webp";
import d_m_ormalamoq from "./dars/rasm/m-ormalamoq.webp";
import d_m_ortasida from "./dars/rasm/m-ortasida.webp";
import d_m_akvarium from "./dars/rasm/m-akvarium.webp";
import d_m_ananas from "./dars/rasm/m-ananas.webp";
import d_m_anor from "./dars/rasm/m-anor.webp";
import d_m_avval_birinchi from "./dars/rasm/m-avval-birinchi.webp";
import d_m_avval from "./dars/rasm/m-avval.webp";
import d_m_balkon from "./dars/rasm/m-balkon.webp";
import d_m_band from "./dars/rasm/m-band.webp";
import d_m_basketbol from "./dars/rasm/m-basketbol.webp";
import d_m_bayroq from "./dars/rasm/m-bayroq.webp";
import d_m_bekat from "./dars/rasm/m-bekat.webp";
import d_m_bir_yil from "./dars/rasm/m-bir-yil.webp";
import d_m_birga from "./dars/rasm/m-birga.webp";
import d_m_bolalar_maydonchasi from "./dars/rasm/m-bolalar-maydonchasi.webp";
import d_m_boqmoq_ovqat_bermoq from "./dars/rasm/m-boqmoq-ovqat-bermoq.webp";
import d_m_bor from "./dars/rasm/m-bor.webp";
import d_m_bormoq from "./dars/rasm/m-bormoq.webp";
import d_m_boshlanmoq from "./dars/rasm/m-boshlanmoq.webp";
import d_m_botqa from "./dars/rasm/m-botqa.webp";
import d_m_chapda from "./dars/rasm/m-chapda.webp";
import d_m_chapga_chapda from "./dars/rasm/m-chapga-chapda.webp";
import d_m_chempion_golib from "./dars/rasm/m-chempion-golib.webp";
import d_m_chempion from "./dars/rasm/m-chempion.webp";
import d_m_chiroq from "./dars/rasm/m-chiroq.webp";
import d_m_chorak from "./dars/rasm/m-chorak.webp";
import d_m_chotkalamoq from "./dars/rasm/m-chotkalamoq.webp";
import d_m_da_ichida from "./dars/rasm/m-da-ichida.webp";
import d_m_dan from "./dars/rasm/m-dan.webp";
import d_m_daqiqa from "./dars/rasm/m-daqiqa.webp";
import d_m_dars_jadvali from "./dars/rasm/m-dars-jadvali.webp";
import d_m_dars_tayyorlamoq from "./dars/rasm/m-dars-tayyorlamoq.webp";
import d_m_dars from "./dars/rasm/m-dars.webp";
import d_m_darvoza_gol from "./dars/rasm/m-darvoza-gol.webp";
import d_m_direktor from "./dars/rasm/m-direktor.webp";
import d_m_don_urug from "./dars/rasm/m-don-urug.webp";
import d_m_don from "./dars/rasm/m-don.webp";
import d_m_donlar from "./dars/rasm/m-donlar.webp";
import d_m_dorixona from "./dars/rasm/m-dorixona.webp";
import d_m_dubulga from "./dars/rasm/m-dubulga.webp";
import d_m_dugona from "./dars/rasm/m-dugona.webp";
import d_m_dum from "./dars/rasm/m-dum.webp";
import d_m_dush_qabul_qilmoq from "./dars/rasm/m-dush-qabul-qilmoq.webp";
import d_m_eng_yaxshi from "./dars/rasm/m-eng-yaxshi.webp";
import d_m_erkalamoq_quchoqlamoq from "./dars/rasm/m-erkalamoq-quchoqlamoq.webp";
import d_m_erta from "./dars/rasm/m-erta.webp";
import d_m_ertak from "./dars/rasm/m-ertak.webp";
import d_m_eski_qadimiy_keksa from "./dars/rasm/m-eski-qadimiy-keksa.webp";
import d_m_eski from "./dars/rasm/m-eski.webp";
import d_m_favvora_quduq from "./dars/rasm/m-favvora-quduq.webp";
import d_m_favvora from "./dars/rasm/m-favvora.webp";
import d_m_foydali_soglom from "./dars/rasm/m-foydali-soglom.webp";
import d_m_foydali from "./dars/rasm/m-foydali.webp";
import d_m_fransiya from "./dars/rasm/m-fransiya.webp";
import d_m_fransuz_tili from "./dars/rasm/m-fransuz-tili.webp";
import d_m_gapirmoq from "./dars/rasm/m-gapirmoq.webp";
import d_m_germaniya from "./dars/rasm/m-germaniya.webp";
import d_m_gitara from "./dars/rasm/m-gitara.webp";
import d_m_gol_darvoza from "./dars/rasm/m-gol-darvoza.webp";
import d_m_gol_urmoq from "./dars/rasm/m-gol-urmoq.webp";
import d_m_gol from "./dars/rasm/m-gol.webp";
import d_m_guldon from "./dars/rasm/m-guldon.webp";
import d_m_gultuvak from "./dars/rasm/m-gultuvak.webp";
import d_m_hamyak from "./dars/rasm/m-hamyak.webp";
import d_m_har_kuni from "./dars/rasm/m-har-kuni.webp";
import d_m_hovli from "./dars/rasm/m-hovli.webp";
import d_m_hurmoq from "./dars/rasm/m-hurmoq.webp";
import d_m_ispan_tili from "./dars/rasm/m-ispan-tili.webp";
import d_m_ispaniya from "./dars/rasm/m-ispaniya.webp";
import d_m_jamoa from "./dars/rasm/m-jamoa.webp";
import d_m_javon_shkaf from "./dars/rasm/m-javon-shkaf.webp";
import d_m_javon_tokcha from "./dars/rasm/m-javon-tokcha.webp";
import d_m_jiringlamoq from "./dars/rasm/m-jiringlamoq.webp";
import d_m_jismoniy_tarbiya from "./dars/rasm/m-jismoniy-tarbiya.webp";
import d_m_juda_mazali from "./dars/rasm/m-juda-mazali.webp";
import d_m_kafe from "./dars/rasm/m-kafe.webp";
import d_m_uyqusi_kelgan from "./dars/rasm/m-uyqusi-kelgan.webp";
import d_m_uzun from "./dars/rasm/m-uzun.webp";
import d_m_xohlayman from "./dars/rasm/m-xohlayman.webp";
import d_m_xona from "./dars/rasm/m-xona.webp";
import d_m_yakshanba from "./dars/rasm/m-yakshanba.webp";
import d_m_yasangan_oqlangan from "./dars/rasm/m-yasangan-oqlangan.webp";
import d_m_yech from "./dars/rasm/m-yech.webp";
import d_m_yechmoq from "./dars/rasm/m-yechmoq.webp";
import d_m_yelim from "./dars/rasm/m-yelim.webp";
import d_m_yigirma from "./dars/rasm/m-yigirma.webp";
import d_m_yigishtir from "./dars/rasm/m-yigishtir.webp";
import d_m_yiglamoq from "./dars/rasm/m-yiglamoq.webp";
import d_m_yiglash from "./dars/rasm/m-yiglash.webp";
import d_m_yiglayapti from "./dars/rasm/m-yiglayapti.webp";
import d_m_yopmoq from "./dars/rasm/m-yopmoq.webp";
import d_m_yoqimli_gozal from "./dars/rasm/m-yoqimli-gozal.webp";
import d_m_yordam_ber from "./dars/rasm/m-yordam-ber.webp";
import d_m_yordam_bermoq from "./dars/rasm/m-yordam-bermoq.webp";
import d_m_yotibdi_turibdi from "./dars/rasm/m-yotibdi-turibdi.webp";
import d_m_yotoqxona from "./dars/rasm/m-yotoqxona.webp";
import d_m_yubka from "./dars/rasm/m-yubka.webp";
import d_m_yurish from "./dars/rasm/m-yurish.webp";
import d_m_yurmoq from "./dars/rasm/m-yurmoq.webp";
import d_m_yuz from "./dars/rasm/m-yuz.webp";
import d_m_zerikarli from "./dars/rasm/m-zerikarli.webp";
import d_m_zerikkan from "./dars/rasm/m-zerikkan.webp";
import d_m_karam from "./dars/rasm/m-karam.webp";
import d_m_katta from "./dars/rasm/m-katta.webp";
import d_m_kech from "./dars/rasm/m-kech.webp";
import d_m_kechirasiz_uzr from "./dars/rasm/m-kechirasiz-uzr.webp";
import d_m_kechirasiz from "./dars/rasm/m-kechirasiz.webp";
import d_m_kesib_otmoq from "./dars/rasm/m-kesib-otmoq.webp";
import d_m_keyin from "./dars/rasm/m-keyin.webp";
import d_m_kichik from "./dars/rasm/m-kichik.webp";
import d_m_kilogramm from "./dars/rasm/m-kilogramm.webp";
import d_m_kinoteatr from "./dars/rasm/m-kinoteatr.webp";
import d_m_kivi from "./dars/rasm/m-kivi.webp";
import d_m_kiyim_shkafi from "./dars/rasm/m-kiyim-shkafi.webp";
import d_m_kol from "./dars/rasm/m-kol.webp";
import d_m_konki from "./dars/rasm/m-konki.webp";
import d_m_konkida_uchmoq from "./dars/rasm/m-konkida-uchmoq.webp";
import d_m_koprik from "./dars/rasm/m-koprik.webp";
import d_m_korpa_adyol from "./dars/rasm/m-korpa-adyol.webp";
import d_m_korpa from "./dars/rasm/m-korpa.webp";
import d_m_kosa_idish from "./dars/rasm/m-kosa-idish.webp";
import d_m_kosa_tovoq from "./dars/rasm/m-kosa-tovoq.webp";
import d_m_kosa from "./dars/rasm/m-kosa.webp";
import d_m_kubok from "./dars/rasm/m-kubok.webp";
import d_m_kuchli from "./dars/rasm/m-kuchli.webp";
import d_m_kunduzi from "./dars/rasm/m-kunduzi.webp";
import d_m_kurash from "./dars/rasm/m-kurash.webp";
import d_m_kutmoq from "./dars/rasm/m-kutmoq.webp";
import d_m_kutubxona from "./dars/rasm/m-kutubxona.webp";
import d_m_kvartira from "./dars/rasm/m-kvartira.webp";
import d_m_mahalla_tuman from "./dars/rasm/m-mahalla-tuman.webp";
import d_m_maktab_hovlisi from "./dars/rasm/m-maktab-hovlisi.webp";
import d_m_maktabga_bormoq from "./dars/rasm/m-maktabga-bormoq.webp";
import d_m_mamlakat from "./dars/rasm/m-mamlakat.webp";
import d_m_mana_bu from "./dars/rasm/m-mana-bu.webp";
import d_m_mashhur from "./dars/rasm/m-mashhur.webp";
import d_m_mashq_qilmoq from "./dars/rasm/m-mashq-qilmoq.webp";
import d_m_matematika from "./dars/rasm/m-matematika.webp";
import d_m_maydoncha from "./dars/rasm/m-maydoncha.webp";
import d_m_medal from "./dars/rasm/m-medal.webp";
import d_m_mening_uyimda from "./dars/rasm/m-mening-uyimda.webp";
import d_m_murabbiy from "./dars/rasm/m-murabbiy.webp";
import d_m_muzey from "./dars/rasm/m-muzey.webp";
import d_m_nemis_tili from "./dars/rasm/m-nemis-tili.webp";
import d_m_non_dokoni from "./dars/rasm/m-non-dokoni.webp";
import d_m_nonushta_qilmoq from "./dars/rasm/m-nonushta-qilmoq.webp";
import d_m_nonushta from "./dars/rasm/m-nonushta.webp";
import d_m_nonvoyxona from "./dars/rasm/m-nonvoyxona.webp";
import d_m_nordon from "./dars/rasm/m-nordon.webp";
import d_m_novvoyxona from "./dars/rasm/m-novvoyxona.webp";
import d_m_odamlar from "./dars/rasm/m-odamlar.webp";
import d_m_olcha from "./dars/rasm/m-olcha.webp";
import d_m_olxori from "./dars/rasm/m-olxori.webp";
import d_m_ongda from "./dars/rasm/m-ongda.webp";
import d_m_ongga_ongda from "./dars/rasm/m-ongga-ongda.webp";
import d_m_oqituvchi_ustoz from "./dars/rasm/m-oqituvchi-ustoz.webp";
import d_m_orik from "./dars/rasm/m-orik.webp";
import d_m_ortoq from "./dars/rasm/m-ortoq.webp";
import d_m_osilib_turmoq from "./dars/rasm/m-osilib-turmoq.webp";
import d_m_osimlik_gul from "./dars/rasm/m-osimlik-gul.webp";
import d_m_osimlik from "./dars/rasm/m-osimlik.webp";
import d_m_osmoq from "./dars/rasm/m-osmoq.webp";
import d_m_ot from "./dars/rasm/m-ot.webp";
import d_m_otmoq_uloqtirmoq from "./dars/rasm/m-otmoq-uloqtirmoq.webp";
import d_m_ovqat_bermoq from "./dars/rasm/m-ovqat-bermoq.webp";
import d_m_ovqat from "./dars/rasm/m-ovqat.webp";
import d_m_oy from "./dars/rasm/m-oy.webp";
import d_m_oyin_maydonchasi from "./dars/rasm/m-oyin-maydonchasi.webp";
import d_m_oyin_musobaqa from "./dars/rasm/m-oyin-musobaqa.webp";
import d_m_oyin_uchrashuv from "./dars/rasm/m-oyin-uchrashuv.webp";
import d_m_oyin from "./dars/rasm/m-oyin.webp";
import d_m_oyinchi from "./dars/rasm/m-oyinchi.webp";
import d_m_oylamoq from "./dars/rasm/m-oylamoq.webp";
import d_m_oyna_kozgu from "./dars/rasm/m-oyna-kozgu.webp";
import d_m_oyna from "./dars/rasm/m-oyna.webp";
import d_m_oynamoq from "./dars/rasm/m-oynamoq.webp";
import d_m_oz_vaqtida from "./dars/rasm/m-oz-vaqtida.webp";
import d_m_ozbekiston from "./dars/rasm/m-ozbekiston.webp";
import d_m_panja_oyoq from "./dars/rasm/m-panja-oyoq.webp";
import d_m_panja from "./dars/rasm/m-panja.webp";
import d_m_parvarish_qilmoq from "./dars/rasm/m-parvarish-qilmoq.webp";
import d_m_pastda from "./dars/rasm/m-pastda.webp";
import d_m_patlar from "./dars/rasm/m-patlar.webp";
import d_m_peshin_noni from "./dars/rasm/m-peshin-noni.webp";
import d_m_peshin_ovqati from "./dars/rasm/m-peshin-ovqati.webp";
import d_m_pianino from "./dars/rasm/m-pianino.webp";
import d_m_pichoq from "./dars/rasm/m-pichoq.webp";
import d_m_piyoda_yurmoq from "./dars/rasm/m-piyoda-yurmoq.webp";
import d_m_piyoda from "./dars/rasm/m-piyoda.webp";
import d_m_plakat from "./dars/rasm/m-plakat.webp";
import d_m_pol_qavat from "./dars/rasm/m-pol-qavat.webp";
import d_m_porlamoq from "./dars/rasm/m-porlamoq.webp";
import d_m_poytaxt from "./dars/rasm/m-poytaxt.webp";
import d_m_qadimiy from "./dars/rasm/m-qadimiy.webp";
import d_m_qafas from "./dars/rasm/m-qafas.webp";
import d_m_qalampir from "./dars/rasm/m-qalampir.webp";
import d_m_qanot from "./dars/rasm/m-qanot.webp";
import d_m_qanotlar from "./dars/rasm/m-qanotlar.webp";
import d_m_qarshisida from "./dars/rasm/m-qarshisida.webp";
import d_m_qavat from "./dars/rasm/m-qavat.webp";
import d_m_qayerdan from "./dars/rasm/m-qayerdan.webp";
import d_m_qaytmoq from "./dars/rasm/m-qaytmoq.webp";
import d_m_qilmoq from "./dars/rasm/m-qilmoq.webp";
import d_m_qishloq from "./dars/rasm/m-qishloq.webp";
import d_m_qiziq_kulgili from "./dars/rasm/m-qiziq-kulgili.webp";
import d_m_qiziq from "./dars/rasm/m-qiziq.webp";
import d_m_qiziqarli_kulgili from "./dars/rasm/m-qiziqarli-kulgili.webp";
import d_m_qiziqarli_maroqli from "./dars/rasm/m-qiziqarli-maroqli.webp";
import d_m_qiziqarli from "./dars/rasm/m-qiziqarli.webp";
import d_m_qongiroq from "./dars/rasm/m-qongiroq.webp";
import d_m_qorongi from "./dars/rasm/m-qorongi.webp";
import d_m_qoshni from "./dars/rasm/m-qoshni.webp";
import d_m_raketka from "./dars/rasm/m-raketka.webp";
import d_m_rasm_surat from "./dars/rasm/m-rasm-surat.webp";
import d_m_rasm from "./dars/rasm/m-rasm.webp";
import d_m_rolikda_uchmoq from "./dars/rasm/m-rolikda-uchmoq.webp";
import d_m_rosa from "./dars/rasm/m-rosa.webp";
import d_m_sabzavot from "./dars/rasm/m-sabzavot.webp";
import d_m_sabzavotlar from "./dars/rasm/m-sabzavotlar.webp";
import d_m_sanchqi from "./dars/rasm/m-sanchqi.webp";
import d_m_sarimsoq from "./dars/rasm/m-sarimsoq.webp";
import d_m_sayyoh_turist from "./dars/rasm/m-sayyoh-turist.webp";
import d_m_sayyoh from "./dars/rasm/m-sayyoh.webp";
import d_m_sekin from "./dars/rasm/m-sekin.webp";
import d_m_senga_tanishtiraman from "./dars/rasm/m-senga-tanishtiraman.webp";
import d_m_seni_bilan_tanishtiraman from "./dars/rasm/m-seni-bilan-tanishtiraman.webp";
import d_m_shaharcha_shahar from "./dars/rasm/m-shaharcha-shahar.webp";
import d_m_shaxmat from "./dars/rasm/m-shaxmat.webp";
import d_m_shift from "./dars/rasm/m-shift.webp";
import d_m_ship from "./dars/rasm/m-ship.webp";
import d_m_shirin from "./dars/rasm/m-shirin.webp";
import d_m_shoshilmoq from "./dars/rasm/m-shoshilmoq.webp";
import d_m_sinfdosh from "./dars/rasm/m-sinfdosh.webp";
import d_m_soat from "./dars/rasm/m-soat.webp";
import d_m_sochiq from "./dars/rasm/m-sochiq.webp";
import d_m_sogliq from "./dars/rasm/m-sogliq.webp";
import d_m_sotib_olmoq from "./dars/rasm/m-sotib-olmoq.webp";
import d_m_sport from "./dars/rasm/m-sport.webp";
import d_m_stadion from "./dars/rasm/m-stadion.webp";
import d_m_sugormoq from "./dars/rasm/m-sugormoq.webp";
import d_m_sumka from "./dars/rasm/m-sumka.webp";
import d_m_tanimoq from "./dars/rasm/m-tanimoq.webp";
import d_m_tanishmoq_uchrashmoq from "./dars/rasm/m-tanishmoq-uchrashmoq.webp";
import d_m_tanishmoq from "./dars/rasm/m-tanishmoq.webp";
import d_m_tartibsiz_betartib from "./dars/rasm/m-tartibsiz-betartib.webp";
import d_m_tartibsiz_sochilgan from "./dars/rasm/m-tartibsiz-sochilgan.webp";
import d_m_tartibsiz from "./dars/rasm/m-tartibsiz.webp";
import d_m_tartibsizlik from "./dars/rasm/m-tartibsizlik.webp";
import d_m_tayyor from "./dars/rasm/m-tayyor.webp";
import d_m_tennis from "./dars/rasm/m-tennis.webp";
import d_m_tez from "./dars/rasm/m-tez.webp";
import d_m_togriga from "./dars/rasm/m-togriga.webp";
import d_m_tom from "./dars/rasm/m-tom.webp";
import d_m_tortma from "./dars/rasm/m-tortma.webp";
import d_m_totiqush from "./dars/rasm/m-totiqush.webp";
import d_m_tozalamoq from "./dars/rasm/m-tozalamoq.webp";
import d_m_tugamoq from "./dars/rasm/m-tugamoq.webp";
import d_m_turmoq from "./dars/rasm/m-turmoq.webp";
import d_m_tush_kormoq from "./dars/rasm/m-tush-kormoq.webp";
import d_m_tush_payti from "./dars/rasm/m-tush-payti.webp";
import d_m_tush from "./dars/rasm/m-tush.webp";
import d_m_tushdan_keyin_kunduzi from "./dars/rasm/m-tushdan-keyin-kunduzi.webp";
import d_m_tushdan_keyin from "./dars/rasm/m-tushdan-keyin.webp";
import d_m_tushlik_qilmoq from "./dars/rasm/m-tushlik-qilmoq.webp";
import d_m_tuvak from "./dars/rasm/m-tuvak.webp";
import d_m_uchmoq_minib_sayr_qilmoq from "./dars/rasm/m-uchmoq-minib-sayr-qilmoq.webp";
import d_m_uruglar_don from "./dars/rasm/m-uruglar-don.webp";
import d_m_uruglar from "./dars/rasm/m-uruglar.webp";
import d_m_ushlamoq_tutmoq from "./dars/rasm/m-ushlamoq-tutmoq.webp";
import d_m_uxlashga_yotmoq from "./dars/rasm/m-uxlashga-yotmoq.webp";
import d_m_uy_hayvoni from "./dars/rasm/m-uy-hayvoni.webp";
import d_m_uy_vazifasi from "./dars/rasm/m-uy-vazifasi.webp";
import d_m_uy_vazifasini_bajarmoq from "./dars/rasm/m-uy-vazifasini-bajarmoq.webp";
import d_m_uy_xonadon from "./dars/rasm/m-uy-xonadon.webp";
import d_m_uygonmoq from "./dars/rasm/m-uygonmoq.webp";
import d_m_uzoq from "./dars/rasm/m-uzoq.webp";
import d_m_uzoqda from "./dars/rasm/m-uzoqda.webp";
import d_m_vaqt from "./dars/rasm/m-vaqt.webp";
import d_m_vilka from "./dars/rasm/m-vilka.webp";
import d_m_voleybol from "./dars/rasm/m-voleybol.webp";
import d_m_xomyak from "./dars/rasm/m-xomyak.webp";
import d_m_xush_kelibsiz from "./dars/rasm/m-xush-kelibsiz.webp";
import d_m_yana_qaytadan from "./dars/rasm/m-yana-qaytadan.webp";
import d_m_yangi_toza from "./dars/rasm/m-yangi-toza.webp";
import d_m_yangi_uzilgan_toza from "./dars/rasm/m-yangi-uzilgan-toza.webp";
import d_m_yaqinida_yaqin from "./dars/rasm/m-yaqinida-yaqin.webp";
import d_m_yaqinida from "./dars/rasm/m-yaqinida.webp";
import d_m_yashamoq from "./dars/rasm/m-yashamoq.webp";
import d_m_yaxshi_mazali from "./dars/rasm/m-yaxshi-mazali.webp";
import d_m_yem from "./dars/rasm/m-yem.webp";
import d_m_yetib_kelmoq from "./dars/rasm/m-yetib-kelmoq.webp";
import d_m_yigishtirmoq from "./dars/rasm/m-yigishtirmoq.webp";
import d_m_yil from "./dars/rasm/m-yil.webp";
import d_m_yongoq from "./dars/rasm/m-yongoq.webp";
import d_m_yongoqlar from "./dars/rasm/m-yongoqlar.webp";
import d_m_yonida_yaqinida from "./dars/rasm/m-yonida-yaqinida.webp";
import d_m_yoqimtoy_chiroyli from "./dars/rasm/m-yoqimtoy-chiroyli.webp";
import d_m_yoqimtoy_shirin from "./dars/rasm/m-yoqimtoy-shirin.webp";
import d_m_yoqimtoy from "./dars/rasm/m-yoqimtoy.webp";
import d_m_yorug from "./dars/rasm/m-yorug.webp";
import d_m_yotmoq from "./dars/rasm/m-yotmoq.webp";
import d_m_yuqorida from "./dars/rasm/m-yuqorida.webp";
import d_m_adashgan from "./dars/rasm/m-adashgan.webp";
import d_m_allo from "./dars/rasm/m-allo.webp";
import d_m_amakivachcha_xolavachcha from "./dars/rasm/m-amakivachcha-xolavachcha.webp";
import d_m_anana from "./dars/rasm/m-anana.webp";
import d_m_ananaviy from "./dars/rasm/m-ananaviy.webp";
import d_m_aqlli_zukko from "./dars/rasm/m-aqlli-zukko.webp";
import d_m_aqlli from "./dars/rasm/m-aqlli.webp";
import d_m_aralashtirmoq_kovlamoq from "./dars/rasm/m-aralashtirmoq-kovlamoq.webp";
import d_m_aralashtirmoq from "./dars/rasm/m-aralashtirmoq.webp";
import d_m_archa from "./dars/rasm/m-archa.webp";
import d_m_argamchi from "./dars/rasm/m-argamchi.webp";
import d_m_argimchoq from "./dars/rasm/m-argimchoq.webp";
import d_m_arzon from "./dars/rasm/m-arzon.webp";
import d_m_attraksionlar from "./dars/rasm/m-attraksionlar.webp";
import d_m_avgust from "./dars/rasm/m-avgust.webp";
import d_m_aynan_hozir from "./dars/rasm/m-aynan-hozir.webp";
import d_m_ayni_damda from "./dars/rasm/m-ayni-damda.webp";
import d_m_ayni_paytda_hozir from "./dars/rasm/m-ayni-paytda-hozir.webp";
import d_m_ayni_paytda from "./dars/rasm/m-ayni-paytda.webp";
import d_m_aytib_bermoq from "./dars/rasm/m-aytib-bermoq.webp";
import d_m_badantarbiya_gimnastika from "./dars/rasm/m-badantarbiya-gimnastika.webp";
import d_m_baland_boyli from "./dars/rasm/m-baland-boyli.webp";
import d_m_baland_katta from "./dars/rasm/m-baland-katta.webp";
import d_m_baliq_ovi from "./dars/rasm/m-baliq-ovi.webp";
import d_m_bank from "./dars/rasm/m-bank.webp";
import d_m_baqirmoq_qichqirmoq from "./dars/rasm/m-baqirmoq-qichqirmoq.webp";
import d_m_baqirmoq from "./dars/rasm/m-baqirmoq.webp";
import d_m_barglar from "./dars/rasm/m-barglar.webp";
import d_m_bayram_qilmoq_nishonlamoq from "./dars/rasm/m-bayram-qilmoq-nishonlamoq.webp";
import d_m_bazan from "./dars/rasm/m-bazan.webp";
import d_m_bazm_ziyofat from "./dars/rasm/m-bazm-ziyofat.webp";
import d_m_bekat_stansiya from "./dars/rasm/m-bekat-stansiya.webp";
import d_m_bekinmachoq from "./dars/rasm/m-bekinmachoq.webp";
import d_m_berkinmoq from "./dars/rasm/m-berkinmoq.webp";
import d_m_bermoq from "./dars/rasm/m-bermoq.webp";
import d_m_bezamoq from "./dars/rasm/m-bezamoq.webp";
import d_m_bino from "./dars/rasm/m-bino.webp";
import d_m_bobo_va_buvi from "./dars/rasm/m-bobo-va-buvi.webp";
import d_m_bolak from "./dars/rasm/m-bolak.webp";
import d_m_bolishmoq from "./dars/rasm/m-bolishmoq.webp";
import d_m_bosh from "./dars/rasm/m-bosh.webp";
import d_m_bozor from "./dars/rasm/m-bozor.webp";
import d_m_bu_qancha_turadi from "./dars/rasm/m-bu-qancha-turadi.webp";
import d_m_bugdoy from "./dars/rasm/m-bugdoy.webp";
import d_m_burchak_muyulish from "./dars/rasm/m-burchak-muyulish.webp";
import d_m_burchak from "./dars/rasm/m-burchak.webp";
import d_m_buril from "./dars/rasm/m-buril.webp";
import d_m_burilmoq from "./dars/rasm/m-burilmoq.webp";
import d_m_buta from "./dars/rasm/m-buta.webp";
import d_m_buterbrod from "./dars/rasm/m-buterbrod.webp";
import d_m_chap_chapga from "./dars/rasm/m-chap-chapga.webp";
import d_m_chapda_chapga from "./dars/rasm/m-chapda-chapga.webp";
import d_m_chapga from "./dars/rasm/m-chapga.webp";
import d_m_chaqirmoq_baqirmoq from "./dars/rasm/m-chaqirmoq-baqirmoq.webp";
import d_m_chipta from "./dars/rasm/m-chipta.webp";
import d_m_chomilmoq from "./dars/rasm/m-chomilmoq.webp";
import d_m_chorraha from "./dars/rasm/m-chorraha.webp";
import d_m_chunki from "./dars/rasm/m-chunki.webp";
import d_m_dam_olmoq from "./dars/rasm/m-dam-olmoq.webp";
import d_m_dan_oldin from "./dars/rasm/m-dan-oldin.webp";
import d_m_dangasa from "./dars/rasm/m-dangasa.webp";
import d_m_darsdan_keyin from "./dars/rasm/m-darsdan-keyin.webp";
import d_m_dasturxon_tuzamoq from "./dars/rasm/m-dasturxon-tuzamoq.webp";
import d_m_dasturxon from "./dars/rasm/m-dasturxon.webp";
import d_m_davom_etmoq_yurib_ketmoq from "./dars/rasm/m-davom-etmoq-yurib-ketmoq.webp";
import d_m_dekabr from "./dars/rasm/m-dekabr.webp";
import d_m_doim_har_doim from "./dars/rasm/m-doim-har-doim.webp";
import d_m_dutor from "./dars/rasm/m-dutor.webp";
import d_m_ellik from "./dars/rasm/m-ellik.webp";
import d_m_fasl from "./dars/rasm/m-fasl.webp";
import d_m_faxrlanadigan_magrur from "./dars/rasm/m-faxrlanadigan-magrur.webp";
import d_m_faxrlanuvchi_magrur from "./dars/rasm/m-faxrlanuvchi-magrur.webp";
import d_m_fevral from "./dars/rasm/m-fevral.webp";
import d_m_gaplashmoq from "./dars/rasm/m-gaplashmoq.webp";
import d_m_gid_yolboshchi from "./dars/rasm/m-gid-yolboshchi.webp";
import d_m_gid_yolboshlovchi from "./dars/rasm/m-gid-yolboshlovchi.webp";
import d_m_gid from "./dars/rasm/m-gid.webp";
import d_m_gimnastika from "./dars/rasm/m-gimnastika.webp";
import d_m_guldasta from "./dars/rasm/m-guldasta.webp";
import d_m_hazil_latifa from "./dars/rasm/m-hazil-latifa.webp";
import d_m_hazil from "./dars/rasm/m-hazil.webp";
import d_m_hech_qachon from "./dars/rasm/m-hech-qachon.webp";
import d_m_hozir_qilyapti from "./dars/rasm/m-hozir-qilyapti.webp";
import d_m_hozir from "./dars/rasm/m-hozir.webp";
import d_m_idish_tovoq from "./dars/rasm/m-idish-tovoq.webp";
import d_m_idish_yuvmoq from "./dars/rasm/m-idish-yuvmoq.webp";
import d_m_iflos from "./dars/rasm/m-iflos.webp";
import d_m_ishlamoq from "./dars/rasm/m-ishlamoq.webp";
import d_m_itarmoq from "./dars/rasm/m-itarmoq.webp";
import d_m_iyul from "./dars/rasm/m-iyul.webp";
import d_m_jasur from "./dars/rasm/m-jasur.webp";
import d_m_javob from "./dars/rasm/m-javob.webp";
import d_m_jim_sokin from "./dars/rasm/m-jim-sokin.webp";
import d_m_jim_sukunat from "./dars/rasm/m-jim-sukunat.webp";
import d_m_jim_tinch from "./dars/rasm/m-jim-tinch.webp";
import d_m_jim_tss from "./dars/rasm/m-jim-tss.webp";
import d_m_jimlik from "./dars/rasm/m-jimlik.webp";
import d_m_jingalak from "./dars/rasm/m-jingalak.webp";
import d_m_jonatmoq from "./dars/rasm/m-jonatmoq.webp";
import d_m_juda_haddan_tashqari from "./dars/rasm/m-juda-haddan-tashqari.webp";
import d_m_jurnal from "./dars/rasm/m-jurnal.webp";
import d_m_kakao from "./dars/rasm/m-kakao.webp";
import d_m_kalendar_taqvim from "./dars/rasm/m-kalendar-taqvim.webp";
import d_m_kerak_bolmoq_muhtoj_bolmoq from "./dars/rasm/m-kerak-bolmoq-muhtoj-bolmoq.webp";
import d_m_keyin_song from "./dars/rasm/m-keyin-song.webp";
import d_m_kochib_kelmoq from "./dars/rasm/m-kochib-kelmoq.webp";
import d_m_kolmak from "./dars/rasm/m-kolmak.webp";
import d_m_komiks from "./dars/rasm/m-komiks.webp";
import d_m_kompot from "./dars/rasm/m-kompot.webp";
import d_m_konvert from "./dars/rasm/m-konvert.webp";
import d_m_korgani_bormoq_mehmonga_bormoq from "./dars/rasm/m-korgani-bormoq-mehmonga-bormoq.webp";
import d_m_kozni_yummoq from "./dars/rasm/m-kozni-yummoq.webp";
import d_m_kozoynak from "./dars/rasm/m-kozoynak.webp";
import d_m_kulgili_hazilkash from "./dars/rasm/m-kulgili-hazilkash.webp";
import d_m_kulgili_quvnoq from "./dars/rasm/m-kulgili-quvnoq.webp";
import d_m_kulgili from "./dars/rasm/m-kulgili.webp";
import d_m_kutib_olmoq from "./dars/rasm/m-kutib-olmoq.webp";
import d_m_lager from "./dars/rasm/m-lager.webp";
import d_m_latifa_hazil from "./dars/rasm/m-latifa-hazil.webp";
import d_m_lenta_bant from "./dars/rasm/m-lenta-bant.webp";
import d_m_lenta from "./dars/rasm/m-lenta.webp";
import d_m_madhiya from "./dars/rasm/m-madhiya.webp";
import d_m_madrasa from "./dars/rasm/m-madrasa.webp";
import d_m_marhamat from "./dars/rasm/m-marhamat.webp";
import d_m_marka from "./dars/rasm/m-marka.webp";
import d_m_markaz from "./dars/rasm/m-markaz.webp";
import d_m_mart from "./dars/rasm/m-mart.webp";
import d_m_mashgulot from "./dars/rasm/m-mashgulot.webp";
import d_m_masjid from "./dars/rasm/m-masjid.webp";
import d_m_may from "./dars/rasm/m-may.webp";
import d_m_maydon from "./dars/rasm/m-maydon.webp";
import d_m_mehmon_bolib_bormoq_ziyorat_qilmoq from "./dars/rasm/m-mehmon-bolib-bormoq-ziyorat-qilmoq.webp";
import d_m_mehmon from "./dars/rasm/m-mehmon.webp";
import d_m_mehribon_xushmuomala from "./dars/rasm/m-mehribon-xushmuomala.webp";
import d_m_mehribon from "./dars/rasm/m-mehribon.webp";
import d_m_men_xohlardim from "./dars/rasm/m-men-xohlardim.webp";
import d_m_metro_bekati from "./dars/rasm/m-metro-bekati.webp";
import d_m_ming from "./dars/rasm/m-ming.webp";
import d_m_mobil_telefon from "./dars/rasm/m-mobil-telefon.webp";
import d_m_moqchi_edim from "./dars/rasm/m-moqchi-edim.webp";
import d_m_multfilm from "./dars/rasm/m-multfilm.webp";
import d_m_multfilmlar from "./dars/rasm/m-multfilmlar.webp";
import d_m_murabbo from "./dars/rasm/m-murabbo.webp";
import d_m_mushakbozlik_feyerverk from "./dars/rasm/m-mushakbozlik-feyerverk.webp";
import d_m_mushakbozlik_salyut from "./dars/rasm/m-mushakbozlik-salyut.webp";
import d_m_mushakbozlik from "./dars/rasm/m-mushakbozlik.webp";
import d_m_musiqa_tinglamoq from "./dars/rasm/m-musiqa-tinglamoq.webp";
import d_m_mustaqillik_kuni from "./dars/rasm/m-mustaqillik-kuni.webp";
import d_m_mustaqillik from "./dars/rasm/m-mustaqillik.webp";
import d_m_muyulish_burchak from "./dars/rasm/m-muyulish-burchak.webp";
import d_m_narx from "./dars/rasm/m-narx.webp";
import d_m_navroz from "./dars/rasm/m-navroz.webp";
import d_m_ning_oxirida from "./dars/rasm/m-ning-oxirida.webp";
import d_m_nishonlamoq_bayram_qilmoq from "./dars/rasm/m-nishonlamoq-bayram-qilmoq.webp";
import d_m_nishonlamoq from "./dars/rasm/m-nishonlamoq.webp";
import d_m_noyabr from "./dars/rasm/m-noyabr.webp";
import d_m_och_rangli from "./dars/rasm/m-och-rangli.webp";
import d_m_ochmoq from "./dars/rasm/m-ochmoq.webp";
import d_m_odatda from "./dars/rasm/m-odatda.webp";
import d_m_odobli from "./dars/rasm/m-odobli.webp";
import d_m_ofis_idora from "./dars/rasm/m-ofis-idora.webp";
import d_m_oktabr from "./dars/rasm/m-oktabr.webp";
import d_m_oktyabr from "./dars/rasm/m-oktyabr.webp";
import d_m_oldin from "./dars/rasm/m-oldin.webp";
import d_m_omlet from "./dars/rasm/m-omlet.webp";
import d_m_ong_ongga from "./dars/rasm/m-ong-ongga.webp";
import d_m_ongda_ongga from "./dars/rasm/m-ongda-ongga.webp";
import d_m_ongga from "./dars/rasm/m-ongga.webp";
import d_m_oqimoq from "./dars/rasm/m-oqimoq.webp";
import d_m_oqituvchilar_kuni from "./dars/rasm/m-oqituvchilar-kuni.webp";
import d_m_oquv_yili from "./dars/rasm/m-oquv-yili.webp";
import d_m_oquv_yilining_boshlanishi from "./dars/rasm/m-oquv-yilining-boshlanishi.webp";
import d_m_oramoq from "./dars/rasm/m-oramoq.webp";
import d_m_orindiq from "./dars/rasm/m-orindiq.webp";
import d_m_ormon from "./dars/rasm/m-ormon.webp";
import d_m_ortasida_orasida from "./dars/rasm/m-ortasida-orasida.webp";
import d_m_ot_maysa from "./dars/rasm/m-ot-maysa.webp";
import d_m_otirmoq from "./dars/rasm/m-otirmoq.webp";
import d_m_otkritka from "./dars/rasm/m-otkritka.webp";
import d_m_otlar_maysa from "./dars/rasm/m-otlar-maysa.webp";
import d_m_ottiz from "./dars/rasm/m-ottiz.webp";
import d_m_ovqat_pishirmoq from "./dars/rasm/m-ovqat-pishirmoq.webp";
import d_m_ozgin_xipcha from "./dars/rasm/m-ozgin-xipcha.webp";
import d_m_ozgin from "./dars/rasm/m-ozgin.webp";
import d_m_paket from "./dars/rasm/m-paket.webp";
import d_m_past_boyli from "./dars/rasm/m-past-boyli.webp";
import d_m_past_kichik from "./dars/rasm/m-past-kichik.webp";
import d_m_pechene from "./dars/rasm/m-pechene.webp";
import d_m_pitsa from "./dars/rasm/m-pitsa.webp";
import d_m_piyoda_yurmoq_sayr_qilmoq from "./dars/rasm/m-piyoda-yurmoq-sayr-qilmoq.webp";
import d_m_pochta_qutisi from "./dars/rasm/m-pochta-qutisi.webp";
import d_m_pochta from "./dars/rasm/m-pochta.webp";
import d_m_yarim from "./dars/rasm/m-yarim.webp";
import d_m_yutmoq from "./dars/rasm/m-yutmoq.webp";
import d_m_yutqazmoq from "./dars/rasm/m-yutqazmoq.webp";
import d_m_yuvinmoq from "./dars/rasm/m-yuvinmoq.webp";
import d_m_yuvmoq from "./dars/rasm/m-yuvmoq.webp";
import d_m_zamonaviy from "./dars/rasm/m-zamonaviy.webp";
import d_m_zina from "./dars/rasm/m-zina.webp";
import d_m_zinapoya from "./dars/rasm/m-zinapoya.webp";
export const DARS_RASM = {
  "d_apple-please": d_apple_please,
  "d_basket": d_basket,
  "d_bathroom": d_bathroom,
  "d_be-quiet": d_be_quiet,
  "d_bear": d_bear,
  "d_big": d_big,
  "d_black": d_black,
  "d_blue": d_blue,
  "d_brown": d_brown,
  "d_bu_mening_akam_yoki_ukam": d_bu_mening_akam_yoki_ukam,
  "d_bu_mening_dadam": d_bu_mening_dadam,
  "d_bu_mening_onam": d_bu_mening_onam,
  "d_bu_mening_opam_yoki_singlim": d_bu_mening_opam_yoki_singlim,
  "d_can-clap": d_can_clap,
  "d_can-i-help": d_can_i_help,
  "d_can-jump": d_can_jump,
  "d_can-you-swim": d_can_you_swim,
  "d_cant-fly": d_cant_fly,
  "d_clap-your-hands": d_clap_your_hands,
  "d_climb": d_climb,
  "d_close-book": d_close_book,
  "d_crocodile": d_crocodile,
  "d_dislike-onions": d_dislike_onions,
  "d_dislike-rain": d_dislike_rain,
  "d_dislike-spiders": d_dislike_spiders,
  "d_do-you-like": d_do_you_like,
  "d_do_st": d_do_st,
  "d_elephant": d_elephant,
  "d_family": d_family,
  "d_farm": d_farm,
  "d_favourite-colour": d_favourite_colour,
  "d_favourite-plov": d_favourite_plov,
  "d_fish-swim": d_fish_swim,
  "d_five-bananas": d_five_bananas,
  "d_fox": d_fox,
  "d_from-uzbekistan": d_from_uzbekistan,
  "d_futbolkam_qizil": d_futbolkam_qizil,
  "d_garden": d_garden,
  "d_giraffe": d_giraffe,
  "d_go-by-bus": d_go_by_bus,
  "d_goodbye-see-you": d_goodbye_see_you,
  "d_green": d_green,
  "d_grey": d_grey,
  "d_have-ball": d_have_ball,
  "d_have-cat": d_have_cat,
  "d_have-dog": d_have_dog,
  "d_have-sister": d_have_sister,
  "d_he-is-doctor": d_he_is_doctor,
  "d_hello": d_hello,
  "d_help-me": d_help_me,
  "d_here-you-are": d_here_you_are,
  "d_how-are-you": d_how_are_you,
  "d_how-go-school": d_how_go_school,
  "d_how-many": d_how_many,
  "d_how-many-bananas": d_how_many_bananas,
  "d_i-am-big": d_i_am_big,
  "d_i-am-five": d_i_am_five,
  "d_i-like": d_i_like,
  "d_i-walk": d_i_walk,
  "d_im-fine": d_im_fine,
  "d_im-thirsty": d_im_thirsty,
  "d_in-box": d_in_box,
  "d_its-a-ball": d_its_a_ball,
  "d_kitchen": d_kitchen,
  "d_kiy": d_kiy,
  "d_lets-count": d_lets_count,
  "d_lets-play": d_lets_play,
  "d_like-apples": d_like_apples,
  "d_like-cats": d_like_cats,
  "d_like-ice-cream": d_like_ice_cream,
  "d_lion": d_lion,
  "d_living-room": d_living_room,
  "d_love-mum": d_love_mum,
  "d_mening_ismim_anvar": d_mening_ismim_anvar,
  "d_money": d_money,
  "d_monkey": d_monkey,
  "d_my-name-is": d_my_name_is,
  "d_my-name-is_2": d_my_name_is_2,
  "d_nice-to-meet": d_nice_to_meet,
  "d_no": d_no,
  "d_no-i-cant": d_no_i_cant,
  "d_no-i-dont": d_no_i_dont,
  "d_of-course": d_of_course,
  "d_on-table": d_on_table,
  "d_open-book": d_open_book,
  "d_owl": d_owl,
  "d_pink": d_pink,
  "d_purple": d_purple,
  "d_raise-hand": d_raise_hand,
  "d_red": d_red,
  "d_ride-bike": d_ride_bike,
  "d_school": d_school,
  "d_shapkangni_kiy": d_shapkangni_kiy,
  "d_she-is-teacher": d_she_is_teacher,
  "d_sit-down": d_sit_down,
  "d_skate": d_skate,
  "d_small": d_small,
  "d_snake": d_snake,
  "d_snake-cant-walk": d_snake_cant_walk,
  "d_snowy": d_snowy,
  "d_stamp-your-feet": d_stamp_your_feet,
  "d_stand-up": d_stand_up,
  "d_stop": d_stop,
  "d_thank-you": d_thank_you,
  "d_this-is-my": d_this_is_my,
  "d_tiger": d_tiger,
  "d_today-is": d_today_is,
  "d_tomorrow": d_tomorrow,
  "d_tuflim_ko_k": d_tuflim_ko_k,
  "d_under-bed": d_under_bed,
  "d_want-pilot": d_want_pilot,
  "d_want-to-be": d_want_to_be,
  "d_weather": d_weather,
  "d_week": d_week,
  "d_weekend": d_weekend,
  "d_well-done": d_well_done,
  "d_what-day": d_what_day,
  "d_what-is-it": d_what_is_it,
  "d_what-like": d_what_like,
  "d_whats-your-name": d_whats_your_name,
  "d_where-cat": d_where_cat,
  "d_where-live": d_where_live,
  "d_white": d_white,
  "d_wolf": d_wolf,
  "d_xursand": d_xursand,
  "d_yes": d_yes,
  "d_yes-i-can": d_yes_i_can,
  "d_yes-i-do": d_yes_i_do,
  "d_yummy": d_yummy,
  "d_zebra": d_zebra,
  "d_chest": d_chest,
  "d_eat-fruit": d_eat_fruit,
  "d_i-go-to-bed": d_i_go_to_bed,
  "d_i-m-ready-for-school": d_i_m_ready_for_school,
  "d_i-visited-my-granny": d_i_visited_my_granny,
  "d_it-was-fun": d_it_was_fun,
  "d_look-left-and-right": d_look_left_and_right,
  "d_open-your-mouth": d_open_your_mouth,
  "d_sababi": d_sababi,
  "d_wash-your-hands-2": d_wash_your_hands_2,
  "d_astronavt": d_astronavt,
  "d_atirgul": d_atirgul,
  "d_axlat-qutisi": d_axlat_qutisi,
  "d_baliqcha": d_baliqcha,
  "d_behind-the-box": d_behind_the_box,
  "d_birinchi": d_birinchi,
  "d_bittani-ayirish": d_bittani_ayirish,
  "d_black-and-white": d_black_and_white,
  "d_burgut": d_burgut,
  "d_buxoro-bug-usi": d_buxoro_bug_usi,
  "d_buxoro": d_buxoro,
  "d_chigirtka": d_chigirtka,
  "d_chorak": d_chorak,
  "d_g-ildirak": d_g_ildirak,
  "d_go-sht": d_go_sht,
  "d_ikkinchi": d_ikkinchi,
  "d_ip-bilan-o-lchash": d_ip_bilan_o_lchash,
  "d_javob": d_javob,
  "d_kit-2": d_kit_2,
  "d_kit": d_kit,
  "d_kulrang-echkemar": d_kulrang_echkemar,
  "d_kurka": d_kurka,
  "d_magnit": d_magnit,
  "d_metroda": d_metroda,
  "d_mo-yqalam": d_mo_yqalam,
  "d_o-t-o-chirgich": d_o_t_o_chirgich,
  "d_og-ir": d_og_ir,
  "d_plastikni": d_plastikni,
  "d_qo-tos": d_qo_tos,
  "d_qor-qoploni": d_qor_qoploni,
  "d_qovun": d_qovun,
  "d_qushlarga-g-amxo-rlik": d_qushlarga_g_amxo_rlik,
  "d_quyosh-nuri-2": d_quyosh_nuri_2,
  "d_quyosh-nuri": d_quyosh_nuri,
  "d_rasmli-misol": d_rasmli_misol,
  "d_shaftoli": d_shaftoli,
  "d_soya": d_soya,
  "d_tik-va-qiya-nur": d_tik_va_qiya_nur,
  "d_til": d_til,
  "d_tortiladi": d_tortiladi,
  "d_tozalik": d_tozalik,
  "d_tuman": d_tuman,
  "d_uch": d_uch,
  "d_uchinchi": d_uchinchi,
  "d_urug-2": d_urug_2,
  "d_uya": d_uya,
  "d_yer-2": d_yer_2,
  "d_yer": d_yer,
  "d_yerning-qiyaligi": d_yerning_qiyaligi,
  "d_yuk-mashinasi": d_yuk_mashinasi,
  "d_101": d_101,
  "d_bir-soatda": d_bir_soatda,
  "d_bugun": d_bugun,
  "d_bulg-or-qalampiri": d_bulg_or_qalampiri,
  "d_cheksiz": d_cheksiz,
  "d_dumalaydigan-shakllar": d_dumalaydigan_shakllar,
  "d_elektr": d_elektr,
  "d_foydali-ovqat": d_foydali_ovqat,
  "d_grafik-diktant": d_grafik_diktant,
  "d_ikki-yuz-va-besh-yuz": d_ikki_yuz_va_besh_yuz,
  "d_istirohat-bog-i": d_istirohat_bog_i,
  "d_jun": d_jun,
  "d_ko-zoynak": d_ko_zoynak,
  "d_kompas": d_kompas,
  "d_kuzatish": d_kuzatish,
  "d_misoldan-masala": d_misoldan_masala,
  "d_momaqaldiroq": d_momaqaldiroq,
  "d_nafas-olish-va-chiqarish": d_nafas_olish_va_chiqarish,
  "d_narx": d_narx,
  "d_olti": d_olti,
  "d_oqqush": d_oqqush,
  "d_ovozini-baland-qilamiz": d_ovozini_baland_qilamiz,
  "d_oxirgi": d_oxirgi,
  "d_oy": d_oy,
  "d_oziq-zanjiri": d_oziq_zanjiri,
  "d_pashsha-va-mikroblar": d_pashsha_va_mikroblar,
  "d_pastda": d_pastda,
  "d_pingvin": d_pingvin,
  "d_qadam": d_qadam,
  "d_qator": d_qator,
  "d_qayta-foydalanish-2": d_qayta_foydalanish_2,
  "d_qayta-ishlash": d_qayta_ishlash,
  "d_qishki-uyqu": d_qishki_uyqu,
  "d_qo-shiq": d_qo_shiq,
  "d_qoldiq": d_qoldiq,
  "d_qon": d_qon,
  "d_qonuniyat": d_qonuniyat,
  "d_qulf": d_qulf,
  "d_qum-ostiga-yashirinadi": d_qum_ostiga_yashirinadi,
  "d_sarg-ayadi": d_sarg_ayadi,
  "d_sayyora": d_sayyora,
  "d_tajriba": d_tajriba,
  "d_temir-mixni": d_temir_mixni,
  "d_to-qqiz": d_to_qqiz,
  "d_yashil-rang": d_yashil_rang,
  "d_yeb-qo-ydi": d_yeb_qo_ydi,
  "d_yog-ochni": d_yog_ochni,
  "d_yulduzli-osmon": d_yulduzli_osmon,
  "d_yuz-so-mlik": d_yuz_so_mlik,
  "d_yuzlab-yil": d_yuzlab_yil,
  "d_cut": d_cut,
  "d_i-get-up": d_i_get_up,
  "d_i-went-to-the-park": d_i_went_to_the_park,
  "d_the-cat-is-sleeping": d_the_cat_is_sleeping,
  "d_what-did-you-do-yesterday": d_what_did_you_do_yesterday,
  "d_what-s-the-matter": d_what_s_the_matter,
  "d_where-is-the-park": d_where_is_the_park,
  "d_1": d_1,
  "d_2": d_2,
  "d_6": d_6,
  "d_7": d_7,
  "d_akula": d_akula,
  "d_bitta": d_bitta,
  "d_burger": d_burger,
  "d_diqqat": d_diqqat,
  "d_do-konga-boramiz": d_do_konga_boramiz,
  "d_dubulg-a": d_dubulg_a,
  "d_hayvonlar-ovqatsiz-qoladi": d_hayvonlar_ovqatsiz_qoladi,
  "d_hech-narsa-bo-lmaydi": d_hech_narsa_bo_lmaydi,
  "d_ildiz-chiriydi": d_ildiz_chiriydi,
  "d_juda-baland-ovozdan-saqlaymiz": d_juda_baland_ovozdan_saqlaymiz,
  "d_kalit": d_kalit,
  "d_kattalarni-chaqiramiz": d_kattalarni_chaqiramiz,
  "d_ko-p-chips": d_ko_p_chips,
  "d_ko-p-qavatli-uy": d_ko_p_qavatli_uy,
  "d_kunduzi": d_kunduzi,
  "d_mushtdek": d_mushtdek,
  "d_ovlaymiz": d_ovlaymiz,
  "d_qisqa-3": d_qisqa_3,
  "d_qo-rqitamiz": d_qo_rqitamiz,
  "d_quvurlar-orqali": d_quvurlar_orqali,
  "d_rasmga-olish": d_rasmga_olish,
  "d_samokat": d_samokat,
  "d_se": d_se,
  "d_sinadi-yoki-to-kiladi": d_sinadi_yoki_to_kiladi,
  "d_suv-qahramoni": d_suv_qahramoni,
  "d_suzdi": d_suzdi,
  "d_tepalik-ustida": d_tepalik_ustida,
  "d_to-kib-yuboramiz": d_to_kib_yuboramiz,
  "d_to-ntaramiz": d_to_ntaramiz,
  "d_tuk-tuk": d_tuk_tuk,
  "d_tuzdan": d_tuzdan,
  "d_u1f314": d_u1f314,
  "d_u1f376": d_u1f376,
  "d_u1f48e": d_u1f48e,
  "d_u1f54a": d_u1f54a,
  "d_u1f91f": d_u1f91f,
  "d_u1f9a9": d_u1f9a9,
  "d_zinapoya": d_zinapoya,
  "d_favourite-green": d_favourite_green,
  "d_have-pet": d_have_pet,
  "d_hi": d_hi,
  "d_how-old": d_how_old,
  "d_like-football": d_like_football,
  "d_live-samarkand": d_live_samarkand,
  "d_see-you-soon": d_see_you_soon,
  "d_this-is-me": d_this_is_me,
  "d_yellow": d_yellow,
  "d_belgi": d_belgi,
  "d_eslab-qol": d_eslab_qol,
  "d_har-safar-ikkitaga-ko-payadi": d_har_safar_ikkitaga_ko_payadi,
  "d_natijasi": d_natijasi,
  "d_navbat": d_navbat,
  "d_sabab": d_sabab,
  "d_tashqarida": d_tashqarida,
  "d_tunda": d_tunda,
  "d_uy-hayvoni": d_uy_hayvoni,
  "d_uyning-ichida": d_uyning_ichida,
  "d_ali-and-i-made-it": d_ali_and_i_made_it,
  "d_goal-hooray-well-done": d_goal_hooray_well_done,
  "d_here-is-the-money-thank": d_here_is_the_money_thank,
  "d_here-is-your-medicine-drink": d_here_is_your_medicine_drink,
  "d_hi-can-you-play-football": d_hi_can_you_play_football,
  "d_i-like-football-my-favourite": d_i_like_football_my_favourite,
  "d_oh-no-my-shoe-can": d_oh_no_my_shoe_can,
  "d_the-zoo-is-next-to": d_the_zoo_is_next_to,
  "d_three-stops-here-is-the": d_three_stops_here_is_the,
  "d_and-eat-fruit-get-well": d_and_eat_fruit_get_well,
  "d_baliq-va-dengiz": d_baliq_va_dengiz,
  "d_har-xil": d_har_xil,
  "d_i-m-ready-i-go": d_i_m_ready_i_go,
  "d_i-visited-my-granny-we": d_i_visited_my_granny_we,
  "d_qisqa": d_qisqa,
  "d_savatdan-tashqarida": d_savatdan_tashqarida,
  "d_thank-you-very-much-goodbye": d_thank_you_very_much_goodbye,
  "d_turn-left-at-the-bakery": d_turn_left_at_the_bakery,
  "d_umumiy-belgi": d_umumiy_belgi,
  "d_behind": d_behind,
  "d_i-go-to-school": d_i_go_to_school,
  "d_in-front-of": d_in_front_of,
  "d_next-to": d_next_to,
  "d_she-is-kind": d_she_is_kind,
  "d_she-is-lazy": d_she_is_lazy,
  "d_the-birds-are-singing": d_the_birds_are_singing,
  "d_the-dog-is-running": d_the_dog_is_running,
  "d_what-time-is-it": d_what_time_is_it,
  "d_angry-child": d_angry_child,
  "d_baby-chick-front-view": d_baby_chick_front_view,
  "d_bar-of-soap-with": d_bar_of_soap_with,
  "d_blue-square-shape": d_blue_square_shape,
  "d_bowl-of-vegetable-salad": d_bowl_of_vegetable_salad,
  "d_bowl-with-spoon": d_bowl_with_spoon,
  "d_boy-raising-hand-my": d_boy_raising_hand_my,
  "d_bus-stop": d_bus_stop,
  "d_calendar": d_calendar,
  "d_chestnut-seed": d_chestnut_seed,
  "d_child-bowing-to-say": d_child_bowing_to_say,
  "d_child-calling-for-help": d_child_calling_for_help,
  "d_child-crossing-arms-saying": d_child_crossing_arms_saying,
  "d_child-with-headache-bandage": d_child_with_headache_bandage,
  "d_child-with-stomachache": d_child_with_stomachache,
  "d_city-skyline-tashkent": d_city_skyline_tashkent,
  "d_clock-showing-half-past": d_clock_showing_half_past,
  "d_clock-showing-seven-o": d_clock_showing_seven_o,
  "d_daisy-flower": d_daisy_flower,
  "d_family-b": d_family_b,
  "d_fork-and-knife": d_fork_and_knife,
  "d_get-well-soon-card": d_get_well_soon_card,
  "d_honeybee": d_honeybee,
  "d_ice-cube": d_ice_cube,
  "d_ladybug": d_ladybug,
  "d_medicine-pills": d_medicine_pills,
  "d_number-ten": d_number_ten,
  "d_nurse": d_nurse,
  "d_orange-color-circle": d_orange_color_circle,
  "d_party-celebration-with-confetti": d_party_celebration_with_confetti,
  "d_pear": d_pear,
  "d_pedestrian-crossing-with-children": d_pedestrian_crossing_with_children,
  "d_pine-forest": d_pine_forest,
  "d_red-triangle-shape": d_red_triangle_shape,
  "d_sad-child-saying-sorry": d_sad_child_saying_sorry,
  "d_sea-waves": d_sea_waves,
  "d_sick-child-with-thermometer": d_sick_child_with_thermometer,
  "d_sleeping-child-in-bed": d_sleeping_child_in_bed,
  "d_small-sprout": d_small_sprout,
  "d_spoon": d_spoon,
  "d_stack-of-books-library": d_stack_of_books_library,
  "d_teapot": d_teapot,
  "d_tear-off-calendar": d_tear_off_calendar,
  "d_thermometer": d_thermometer,
  "d_toothbrush-with-toothpaste": d_toothbrush_with_toothpaste,
  "d_turnip-with-green-leaves": d_turnip_with_green_leaves,
  "d_two-friends-holding-hands": d_two_friends_holding_hands,
  "d_uzbek-flatbread-bakery": d_uzbek_flatbread_bakery,
  "d_watermelon": d_watermelon,
  "d_wrist-watch": d_wrist_watch,
  "d_ant": d_ant,
  "d_baby-chick-side-view": d_baby_chick_side_view,
  "d_bactrian-camel": d_bactrian_camel,
  "d_balance-scales": d_balance_scales,
  "d_bone": d_bone,
  "d_brain": d_brain,
  "d_brown-soil": d_brown_soil,
  "d_butterfly": d_butterfly,
  "d_campfire": d_campfire,
  "d_caterpillar": d_caterpillar,
  "d_cherries": d_cherries,
  "d_clock-showing-eight-o": d_clock_showing_eight_o,
  "d_clock-showing-twelve-o": d_clock_showing_twelve_o,
  "d_cup-of-hot-tea": d_cup_of_hot_tea,
  "d_desert-with-dunes": d_desert_with_dunes,
  "d_diploma-scroll": d_diploma_scroll,
  "d_dolphin": d_dolphin,
  "d_doughnut": d_doughnut,
  "d_factory-with-smoke": d_factory_with_smoke,
  "d_feather": d_feather,
  "d_goat": d_goat,
  "d_graduation-cap": d_graduation_cap,
  "d_green-herb-plant": d_green_herb_plant,
  "d_green-leaf": d_green_leaf,
  "d_happy-child-with-party": d_happy_child_with_party,
  "d_kneeling-child": d_kneeling_child,
  "d_knife-cutting": d_knife_cutting,
  "d_map": d_map,
  "d_mobile-phone": d_mobile_phone,
  "d_monkey-covering-eyes": d_monkey_covering_eyes,
  "d_net-spider-web": d_net_spider_web,
  "d_notebook": d_notebook,
  "d_octopus": d_octopus,
  "d_onion": d_onion,
  "d_potted-plant": d_potted_plant,
  "d_red-square-shape": d_red_square_shape,
  "d_river-landscape": d_river_landscape,
  "d_rock-stone": d_rock_stone,
  "d_rocket": d_rocket,
  "d_snowy-mountains": d_snowy_mountains,
  "d_steam-rising": d_steam_rising,
  "d_stethoscope": d_stethoscope,
  "d_sun-hat": d_sun_hat,
  "d_sunflower": d_sunflower,
  "d_tooth": d_tooth,
  "d_turtle": d_turtle,
  "d_water-splash-puddle": d_water_splash_puddle,
  "d_water-tap-with-drinking": d_water_tap_with_drinking,
  "d_wheat-ears": d_wheat_ears,
  "d_yawning-lazy-child-on": d_yawning_lazy_child_on,
  "d_artist-with-palette": d_artist_with_palette,
  "d_autumn-leaf": d_autumn_leaf,
  "d_beating-heart": d_beating_heart,
  "d_blue-book": d_blue_book,
  "d_chick-hatching-from-egg": d_chick_hatching_from_egg,
  "d_city-at-dusk": d_city_at_dusk,
  "d_clock-face": d_clock_face,
  "d_down-triangle": d_down_triangle,
  "d_electric-plug": d_electric_plug,
  "d_glass-bottle": d_glass_bottle,
  "d_glass-jar": d_glass_jar,
  "d_green-square": d_green_square,
  "d_growth-chart": d_growth_chart,
  "d_half-moon": d_half_moon,
  "d_hedgehog": d_hedgehog,
  "d_honey-pot": d_honey_pot,
  "d_khiva-fortress": d_khiva_fortress,
  "d_lollipop": d_lollipop,
  "d_london-bridge": d_london_bridge,
  "d_lungs": d_lungs,
  "d_neighborhood-houses": d_neighborhood_houses,
  "d_newspaper": d_newspaper,
  "d_night-sky-over-houses": d_night_sky_over_houses,
  "d_oval-ball": d_oval_ball,
  "d_paw-prints": d_paw_prints,
  "d_playground-slide": d_playground_slide,
  "d_railway-track": d_railway_track,
  "d_ribbon-bow": d_ribbon_bow,
  "d_rooster": d_rooster,
  "d_sheet-of-paper": d_sheet_of_paper,
  "d_shopping-list": d_shopping_list,
  "d_shower": d_shower,
  "d_sled": d_sled,
  "d_snowman": d_snowman,
  "d_spinning-swirl": d_spinning_swirl,
  "d_squirrel": d_squirrel,
  "d_stopwatch": d_stopwatch,
  "d_sun-behind-cloud": d_sun_behind_cloud,
  "d_telephone-receiver": d_telephone_receiver,
  "d_telescope": d_telescope,
  "d_tent": d_tent,
  "d_tin-can-cylinder": d_tin_can_cylinder,
  "d_triangle-ruler": d_triangle_ruler,
  "d_waffle": d_waffle,
  "d_white-square": d_white_square,
  "d_wilted-flower": d_wilted_flower,
  "d_wind-gust": d_wind_gust,
  "d_yellow-square": d_yellow_square,
  "d_sahna-how-many-eggs": d_sahna_how_many_eggs,
  "d_sahna-i-do-my-homework": d_sahna_i_do_my_homework,
  "d_sahna-go-straight-then-turn": d_sahna_go_straight_then_turn,
  "d_sahna-salom-doktor": d_sahna_salom_doktor,
  "d_m-ajoyib-zor": d_m_ajoyib_zor,
  "d_m-alo": d_m_alo,
  "d_m-amaki-toga": d_m_amaki_toga,
  "d_m-assalomu-alaykum": d_m_assalomu_alaykum,
  "d_m-bayram": d_m_bayram,
  "d_m-bayramingiz-bilan": d_m_bayramingiz_bilan,
  "d_m-bayramingiz-muborak": d_m_bayramingiz_muborak,
  "d_m-besh": d_m_besh,
  "d_m-bir": d_m_bir,
  "d_m-bolalar": d_m_bolalar,
  "d_m-boshqotirma-pazl": d_m_boshqotirma_pazl,
  "d_m-bu-kim": d_m_bu_kim,
  "d_m-bu-qanday-rang": d_m_bu_qanday_rang,
  "d_m-bu-qanday-rangda": d_m_bu_qanday_rangda,
  "d_m-bu": d_m_bu,
  "d_m-chiroyli": d_m_chiroyli,
  "d_m-depsin": d_m_depsin,
  "d_m-dugona-dost": d_m_dugona_dost,
  "d_m-eng-sevimli": d_m_eng_sevimli,
  "d_m-ertagacha": d_m_ertagacha,
  "d_m-hammasi-joyida-xop": d_m_hammasi_joyida_xop,
  "d_m-havorang": d_m_havorang,
  "d_m-hayvon": d_m_hayvon,
  "d_m-hayvonot-bogi": d_m_hayvonot_bogi,
  "d_m-ich": d_m_ich,
  "d_m-ichmoq": d_m_ichmoq,
  "d_m-ikki": d_m_ikki,
  "d_m-iltimos": d_m_iltimos,
  "d_m-ism": d_m_ism,
  "d_m-janob": d_m_janob,
  "d_m-juda-ham": d_m_juda_ham,
  "d_m-juda-kop": d_m_juda_kop,
  "d_m-juda-yaxshi": d_m_juda_yaxshi,
  "d_m-juda": d_m_juda,
  "d_m-katta-baland": d_m_katta_baland,
  "d_m-kechirasan": d_m_kechirasan,
  "d_m-kichkina": d_m_kichkina,
  "d_m-korishguncha": d_m_korishguncha,
  "d_m-korsat": d_m_korsat,
  "d_m-ma-ol": d_m_ma_ol,
  "d_m-mana-ol": d_m_mana_ol,
  "d_m-mayli-hechqisi-yoq": d_m_mayli_hechqisi_yoq,
  "d_m-mayli-xop": d_m_mayli_xop,
  "d_m-men-ham": d_m_men_ham,
  "d_m-men-ichaman": d_m_men_ichaman,
  "d_m-men-man": d_m_men_man,
  "d_m-men-seni-yaxshi-koraman": d_m_men_seni_yaxshi_koraman,
  "d_m-men-xohlayman": d_m_men_xohlayman,
  "d_m-men-yaxshi-koraman-yoqtiraman": d_m_men_yaxshi_koraman_yoqtiraman,
  "d_m-men-yetti-yoshdaman": d_m_men_yetti_yoshdaman,
  "d_m-men-yoqtiraman": d_m_men_yoqtiraman,
  "d_m-men-yoqtirmayman": d_m_men_yoqtirmayman,
  "d_m-men": d_m_men,
  "d_m-menda-bor": d_m_menda_bor,
  "d_m-menga-yoqadi": d_m_menga_yoqadi,
  "d_m-menga-yoqmaydi": d_m_menga_yoqmaydi,
  "d_m-mening-sevimli-rangim": d_m_mening_sevimli_rangim,
  "d_m-meva": d_m_meva,
  "d_m-mo-o": d_m_mo_o,
  "d_m-mo": d_m_mo,
  "d_m-olti": d_m_olti,
  "d_m-on": d_m_on,
  "d_m-osh-palov": d_m_osh_palov,
  "d_m-osmon": d_m_osmon,
  "d_m-oyinchoq": d_m_oyinchoq,
  "d_m-oynaymiz": d_m_oynaymiz,
  "d_m-ozingchi": d_m_ozingchi,
  "d_m-ozingniki-chi": d_m_ozingniki_chi,
  "d_m-piknik-sayr": d_m_piknik_sayr,
  "d_m-pirildoq-zirillagich": d_m_pirildoq_zirillagich,
  "d_m-qanday-chiroyli": d_m_qanday_chiroyli,
  "d_m-qanday-mazali": d_m_qanday_mazali,
  "d_m-qanday-rang": d_m_qanday_rang,
  "d_m-qanday-rangda": d_m_qanday_rangda,
  "d_m-qanday-yaxshi": d_m_qanday_yaxshi,
  "d_m-qol-silkit-salomlash": d_m_qol_silkit_salomlash,
  "d_m-sakkiz": d_m_sakkiz,
  "d_m-sakra": d_m_sakra,
  "d_m-sanaymiz": d_m_sanaymiz,
  "d_m-sen-chi": d_m_sen_chi,
  "d_m-seni-yaxshi-koraman": d_m_seni_yaxshi_koraman,
  "d_m-sening-navbating": d_m_sening_navbating,
  "d_m-seningchi": d_m_seningchi,
  "d_m-sevimli-rang": d_m_sevimli_rang,
  "d_m-sham": d_m_sham,
  "d_m-silkit": d_m_silkit,
  "d_m-sinf-bolalar": d_m_sinf_bolalar,
  "d_m-ana-u-yerda": d_m_ana_u_yerda,
  "d_m-asalari": d_m_asalari,
  "d_m-baliq": d_m_baliq,
  "d_m-bayram-ziyofat": d_m_bayram_ziyofat,
  "d_m-berib-turasanmi": d_m_berib_turasanmi,
  "d_m-berkinmachoq": d_m_berkinmachoq,
  "d_m-bog-park": d_m_bog_park,
  "d_m-boyamoq": d_m_boyamoq,
  "d_m-bu-yerda": d_m_bu_yerda,
  "d_m-bugun": d_m_bugun,
  "d_m-chanqagan": d_m_chanqagan,
  "d_m-charchadi-charchadim": d_m_charchadi_charchadim,
  "d_m-charchagan": d_m_charchagan,
  "d_m-chiroyli-gozal": d_m_chiroyli_gozal,
  "d_m-chizmoq": d_m_chizmoq,
  "d_m-chorshanba": d_m_chorshanba,
  "d_m-divan": d_m_divan,
  "d_m-doppi": d_m_doppi,
  "d_m-dushanba": d_m_dushanba,
  "d_m-emas": d_m_emas,
  "d_m-gilam": d_m_gilam,
  "d_m-goz": d_m_goz,
  "d_m-hammom-vanna-xonasi": d_m_hammom_vanna_xonasi,
  "d_m-hayron-ajablangan": d_m_hayron_ajablangan,
  "d_m-ichida-da-2": d_m_ichida_da_2,
  "d_m-ichida-da": d_m_ichida_da,
  "d_m-ikkinchi": d_m_ikkinchi,
  "d_m-ilib-olish": d_m_ilib_olish,
  "d_m-ilib-olmoq": d_m_ilib_olmoq,
  "d_m-iliq": d_m_iliq,
  "d_m-jahldor": d_m_jahldor,
  "d_m-jahli-chiqqan": d_m_jahli_chiqqan,
  "d_m-javon": d_m_javon,
  "d_m-juma": d_m_juma,
  "d_m-kalit": d_m_kalit,
  "d_m-kasal": d_m_kasal,
  "d_m-kiyim-kechak": d_m_kiyim_kechak,
  "d_m-kiyim": d_m_kiyim,
  "d_m-kiyimlar": d_m_kiyimlar,
  "d_m-kiymoq": d_m_kiymoq,
  "d_m-kompyuter": d_m_kompyuter,
  "d_m-konsert": d_m_konsert,
  "d_m-kop": d_m_kop,
  "d_m-korkam-chiroyli": d_m_korkam_chiroyli,
  "d_m-koylak": d_m_koylak,
  "d_m-kulish": d_m_kulish,
  "d_m-kulmoq": d_m_kulmoq,
  "d_m-kulyapti": d_m_kulyapti,
  "d_m-kun": d_m_kun,
  "d_m-kutilmagan-sovga-syurpriz": d_m_kutilmagan_sovga_syurpriz,
  "d_m-mana-bu-yerda": d_m_mana_bu_yerda,
  "d_m-mehmonlar": d_m_mehmonlar,
  "d_m-men-izlayapman": d_m_men_izlayapman,
  "d_m-men-kiyganman-ustimda": d_m_men_kiyganman_ustimda,
  "d_m-men-qidiryapman": d_m_men_qidiryapman,
  "d_m-men-qila-olaman": d_m_men_qila_olaman,
  "d_m-soch": d_m_soch,
  "d_m-son-raqam": d_m_son_raqam,
  "d_m-sovga": d_m_sovga,
  "d_m-sumalak": d_m_sumalak,
  "d_m-surat-foto": d_m_surat_foto,
  "d_m-surat-fotosurat": d_m_surat_fotosurat,
  "d_m-teg-ushla": d_m_teg_ushla,
  "d_m-tegin-ushla": d_m_tegin_ushla,
  "d_m-tishlar": d_m_tishlar,
  "d_m-toq-sariq": d_m_toq_sariq,
  "d_m-toqqiz": d_m_toqqiz,
  "d_m-tort": d_m_tort,
  "d_m-tugilgan-kuning-bilan": d_m_tugilgan_kuning_bilan,
  "d_m-u": d_m_u,
  "d_m-uch": d_m_uch,
  "d_m-unchamas-ortacha": d_m_unchamas_ortacha,
  "d_m-ura": d_m_ura,
  "d_m-ustoz": d_m_ustoz,
  "d_m-voy-voy-ajabo": d_m_voy_voy_ajabo,
  "d_m-voy-zor": d_m_voy_zor,
  "d_m-xayr": d_m_xayr,
  "d_m-xayrli-kech": d_m_xayrli_kech,
  "d_m-xayrli-kun": d_m_xayrli_kun,
  "d_m-xonim": d_m_xonim,
  "d_m-yangi": d_m_yangi,
  "d_m-yaxshi": d_m_yaxshi,
  "d_m-ye": d_m_ye,
  "d_m-yemoq": d_m_yemoq,
  "d_m-yetti": d_m_yetti,
  "d_m-yop-yum": d_m_yop_yum,
  "d_m-yoqtirmayman": d_m_yoqtirmayman,
  "d_m-yulduz": d_m_yulduz,
  "d_m-yum-yop": d_m_yum_yop,
  "d_m-zor-ajoyib": d_m_zor_ajoyib,
  "d_m-men-olaman": d_m_men_olaman,
  "d_m-men-olmayman": d_m_men_olmayman,
  "d_m-men-qila-olmayman": d_m_men_qila_olmayman,
  "d_m-men-qorqaman": d_m_men_qorqaman,
  "d_m-menga-ber": d_m_menga_ber,
  "d_m-menga-berib-tur": d_m_menga_berib_tur,
  "d_m-menga-yordam-ber": d_m_menga_yordam_ber,
  "d_m-menga": d_m_menga,
  "d_m-mushukcha": d_m_mushukcha,
  "d_m-ob-havo": d_m_ob_havo,
  "d_m-ochirgich": d_m_ochirgich,
  "d_m-ogriyapti": d_m_ogriyapti,
  "d_m-on-besh": d_m_on_besh,
  "d_m-on-bir": d_m_on_bir,
  "d_m-on-ikki": d_m_on_ikki,
  "d_m-on-olti": d_m_on_olti,
  "d_m-on-sakkiz": d_m_on_sakkiz,
  "d_m-on-toqqiz": d_m_on_toqqiz,
  "d_m-on-tort": d_m_on_tort,
  "d_m-on-uch": d_m_on_uch,
  "d_m-on-yetti": d_m_on_yetti,
  "d_m-oqi": d_m_oqi,
  "d_m-oquvchi": d_m_oquvchi,
  "d_m-ormalamoq": d_m_ormalamoq,
  "d_m-ortasida": d_m_ortasida,
  "d_m-akvarium": d_m_akvarium,
  "d_m-ananas": d_m_ananas,
  "d_m-anor": d_m_anor,
  "d_m-avval-birinchi": d_m_avval_birinchi,
  "d_m-avval": d_m_avval,
  "d_m-balkon": d_m_balkon,
  "d_m-band": d_m_band,
  "d_m-basketbol": d_m_basketbol,
  "d_m-bayroq": d_m_bayroq,
  "d_m-bekat": d_m_bekat,
  "d_m-bir-yil": d_m_bir_yil,
  "d_m-birga": d_m_birga,
  "d_m-bolalar-maydonchasi": d_m_bolalar_maydonchasi,
  "d_m-boqmoq-ovqat-bermoq": d_m_boqmoq_ovqat_bermoq,
  "d_m-bor": d_m_bor,
  "d_m-bormoq": d_m_bormoq,
  "d_m-boshlanmoq": d_m_boshlanmoq,
  "d_m-botqa": d_m_botqa,
  "d_m-chapda": d_m_chapda,
  "d_m-chapga-chapda": d_m_chapga_chapda,
  "d_m-chempion-golib": d_m_chempion_golib,
  "d_m-chempion": d_m_chempion,
  "d_m-chiroq": d_m_chiroq,
  "d_m-chorak": d_m_chorak,
  "d_m-chotkalamoq": d_m_chotkalamoq,
  "d_m-da-ichida": d_m_da_ichida,
  "d_m-dan": d_m_dan,
  "d_m-daqiqa": d_m_daqiqa,
  "d_m-dars-jadvali": d_m_dars_jadvali,
  "d_m-dars-tayyorlamoq": d_m_dars_tayyorlamoq,
  "d_m-dars": d_m_dars,
  "d_m-darvoza-gol": d_m_darvoza_gol,
  "d_m-direktor": d_m_direktor,
  "d_m-don-urug": d_m_don_urug,
  "d_m-don": d_m_don,
  "d_m-donlar": d_m_donlar,
  "d_m-dorixona": d_m_dorixona,
  "d_m-dubulga": d_m_dubulga,
  "d_m-dugona": d_m_dugona,
  "d_m-dum": d_m_dum,
  "d_m-dush-qabul-qilmoq": d_m_dush_qabul_qilmoq,
  "d_m-eng-yaxshi": d_m_eng_yaxshi,
  "d_m-erkalamoq-quchoqlamoq": d_m_erkalamoq_quchoqlamoq,
  "d_m-erta": d_m_erta,
  "d_m-ertak": d_m_ertak,
  "d_m-eski-qadimiy-keksa": d_m_eski_qadimiy_keksa,
  "d_m-eski": d_m_eski,
  "d_m-favvora-quduq": d_m_favvora_quduq,
  "d_m-favvora": d_m_favvora,
  "d_m-foydali-soglom": d_m_foydali_soglom,
  "d_m-foydali": d_m_foydali,
  "d_m-fransiya": d_m_fransiya,
  "d_m-fransuz-tili": d_m_fransuz_tili,
  "d_m-gapirmoq": d_m_gapirmoq,
  "d_m-germaniya": d_m_germaniya,
  "d_m-gitara": d_m_gitara,
  "d_m-gol-darvoza": d_m_gol_darvoza,
  "d_m-gol-urmoq": d_m_gol_urmoq,
  "d_m-gol": d_m_gol,
  "d_m-guldon": d_m_guldon,
  "d_m-gultuvak": d_m_gultuvak,
  "d_m-hamyak": d_m_hamyak,
  "d_m-har-kuni": d_m_har_kuni,
  "d_m-hovli": d_m_hovli,
  "d_m-hurmoq": d_m_hurmoq,
  "d_m-ispan-tili": d_m_ispan_tili,
  "d_m-ispaniya": d_m_ispaniya,
  "d_m-jamoa": d_m_jamoa,
  "d_m-javon-shkaf": d_m_javon_shkaf,
  "d_m-javon-tokcha": d_m_javon_tokcha,
  "d_m-jiringlamoq": d_m_jiringlamoq,
  "d_m-jismoniy-tarbiya": d_m_jismoniy_tarbiya,
  "d_m-juda-mazali": d_m_juda_mazali,
  "d_m-kafe": d_m_kafe,
  "d_m-uyqusi-kelgan": d_m_uyqusi_kelgan,
  "d_m-uzun": d_m_uzun,
  "d_m-xohlayman": d_m_xohlayman,
  "d_m-xona": d_m_xona,
  "d_m-yakshanba": d_m_yakshanba,
  "d_m-yasangan-oqlangan": d_m_yasangan_oqlangan,
  "d_m-yech": d_m_yech,
  "d_m-yechmoq": d_m_yechmoq,
  "d_m-yelim": d_m_yelim,
  "d_m-yigirma": d_m_yigirma,
  "d_m-yigishtir": d_m_yigishtir,
  "d_m-yiglamoq": d_m_yiglamoq,
  "d_m-yiglash": d_m_yiglash,
  "d_m-yiglayapti": d_m_yiglayapti,
  "d_m-yopmoq": d_m_yopmoq,
  "d_m-yoqimli-gozal": d_m_yoqimli_gozal,
  "d_m-yordam-ber": d_m_yordam_ber,
  "d_m-yordam-bermoq": d_m_yordam_bermoq,
  "d_m-yotibdi-turibdi": d_m_yotibdi_turibdi,
  "d_m-yotoqxona": d_m_yotoqxona,
  "d_m-yubka": d_m_yubka,
  "d_m-yurish": d_m_yurish,
  "d_m-yurmoq": d_m_yurmoq,
  "d_m-yuz": d_m_yuz,
  "d_m-zerikarli": d_m_zerikarli,
  "d_m-zerikkan": d_m_zerikkan,
  "d_m-karam": d_m_karam,
  "d_m-katta": d_m_katta,
  "d_m-kech": d_m_kech,
  "d_m-kechirasiz-uzr": d_m_kechirasiz_uzr,
  "d_m-kechirasiz": d_m_kechirasiz,
  "d_m-kesib-otmoq": d_m_kesib_otmoq,
  "d_m-keyin": d_m_keyin,
  "d_m-kichik": d_m_kichik,
  "d_m-kilogramm": d_m_kilogramm,
  "d_m-kinoteatr": d_m_kinoteatr,
  "d_m-kivi": d_m_kivi,
  "d_m-kiyim-shkafi": d_m_kiyim_shkafi,
  "d_m-kol": d_m_kol,
  "d_m-konki": d_m_konki,
  "d_m-konkida-uchmoq": d_m_konkida_uchmoq,
  "d_m-koprik": d_m_koprik,
  "d_m-korpa-adyol": d_m_korpa_adyol,
  "d_m-korpa": d_m_korpa,
  "d_m-kosa-idish": d_m_kosa_idish,
  "d_m-kosa-tovoq": d_m_kosa_tovoq,
  "d_m-kosa": d_m_kosa,
  "d_m-kubok": d_m_kubok,
  "d_m-kuchli": d_m_kuchli,
  "d_m-kunduzi": d_m_kunduzi,
  "d_m-kurash": d_m_kurash,
  "d_m-kutmoq": d_m_kutmoq,
  "d_m-kutubxona": d_m_kutubxona,
  "d_m-kvartira": d_m_kvartira,
  "d_m-mahalla-tuman": d_m_mahalla_tuman,
  "d_m-maktab-hovlisi": d_m_maktab_hovlisi,
  "d_m-maktabga-bormoq": d_m_maktabga_bormoq,
  "d_m-mamlakat": d_m_mamlakat,
  "d_m-mana-bu": d_m_mana_bu,
  "d_m-mashhur": d_m_mashhur,
  "d_m-mashq-qilmoq": d_m_mashq_qilmoq,
  "d_m-matematika": d_m_matematika,
  "d_m-maydoncha": d_m_maydoncha,
  "d_m-medal": d_m_medal,
  "d_m-mening-uyimda": d_m_mening_uyimda,
  "d_m-murabbiy": d_m_murabbiy,
  "d_m-muzey": d_m_muzey,
  "d_m-nemis-tili": d_m_nemis_tili,
  "d_m-non-dokoni": d_m_non_dokoni,
  "d_m-nonushta-qilmoq": d_m_nonushta_qilmoq,
  "d_m-nonushta": d_m_nonushta,
  "d_m-nonvoyxona": d_m_nonvoyxona,
  "d_m-nordon": d_m_nordon,
  "d_m-novvoyxona": d_m_novvoyxona,
  "d_m-odamlar": d_m_odamlar,
  "d_m-olcha": d_m_olcha,
  "d_m-olxori": d_m_olxori,
  "d_m-ongda": d_m_ongda,
  "d_m-ongga-ongda": d_m_ongga_ongda,
  "d_m-oqituvchi-ustoz": d_m_oqituvchi_ustoz,
  "d_m-orik": d_m_orik,
  "d_m-ortoq": d_m_ortoq,
  "d_m-osilib-turmoq": d_m_osilib_turmoq,
  "d_m-osimlik-gul": d_m_osimlik_gul,
  "d_m-osimlik": d_m_osimlik,
  "d_m-osmoq": d_m_osmoq,
  "d_m-ot": d_m_ot,
  "d_m-otmoq-uloqtirmoq": d_m_otmoq_uloqtirmoq,
  "d_m-ovqat-bermoq": d_m_ovqat_bermoq,
  "d_m-ovqat": d_m_ovqat,
  "d_m-oy": d_m_oy,
  "d_m-oyin-maydonchasi": d_m_oyin_maydonchasi,
  "d_m-oyin-musobaqa": d_m_oyin_musobaqa,
  "d_m-oyin-uchrashuv": d_m_oyin_uchrashuv,
  "d_m-oyin": d_m_oyin,
  "d_m-oyinchi": d_m_oyinchi,
  "d_m-oylamoq": d_m_oylamoq,
  "d_m-oyna-kozgu": d_m_oyna_kozgu,
  "d_m-oyna": d_m_oyna,
  "d_m-oynamoq": d_m_oynamoq,
  "d_m-oz-vaqtida": d_m_oz_vaqtida,
  "d_m-ozbekiston": d_m_ozbekiston,
  "d_m-panja-oyoq": d_m_panja_oyoq,
  "d_m-panja": d_m_panja,
  "d_m-parvarish-qilmoq": d_m_parvarish_qilmoq,
  "d_m-pastda": d_m_pastda,
  "d_m-patlar": d_m_patlar,
  "d_m-peshin-noni": d_m_peshin_noni,
  "d_m-peshin-ovqati": d_m_peshin_ovqati,
  "d_m-pianino": d_m_pianino,
  "d_m-pichoq": d_m_pichoq,
  "d_m-piyoda-yurmoq": d_m_piyoda_yurmoq,
  "d_m-piyoda": d_m_piyoda,
  "d_m-plakat": d_m_plakat,
  "d_m-pol-qavat": d_m_pol_qavat,
  "d_m-porlamoq": d_m_porlamoq,
  "d_m-poytaxt": d_m_poytaxt,
  "d_m-qadimiy": d_m_qadimiy,
  "d_m-qafas": d_m_qafas,
  "d_m-qalampir": d_m_qalampir,
  "d_m-qanot": d_m_qanot,
  "d_m-qanotlar": d_m_qanotlar,
  "d_m-qarshisida": d_m_qarshisida,
  "d_m-qavat": d_m_qavat,
  "d_m-qayerdan": d_m_qayerdan,
  "d_m-qaytmoq": d_m_qaytmoq,
  "d_m-qilmoq": d_m_qilmoq,
  "d_m-qishloq": d_m_qishloq,
  "d_m-qiziq-kulgili": d_m_qiziq_kulgili,
  "d_m-qiziq": d_m_qiziq,
  "d_m-qiziqarli-kulgili": d_m_qiziqarli_kulgili,
  "d_m-qiziqarli-maroqli": d_m_qiziqarli_maroqli,
  "d_m-qiziqarli": d_m_qiziqarli,
  "d_m-qongiroq": d_m_qongiroq,
  "d_m-qorongi": d_m_qorongi,
  "d_m-qoshni": d_m_qoshni,
  "d_m-raketka": d_m_raketka,
  "d_m-rasm-surat": d_m_rasm_surat,
  "d_m-rasm": d_m_rasm,
  "d_m-rolikda-uchmoq": d_m_rolikda_uchmoq,
  "d_m-rosa": d_m_rosa,
  "d_m-sabzavot": d_m_sabzavot,
  "d_m-sabzavotlar": d_m_sabzavotlar,
  "d_m-sanchqi": d_m_sanchqi,
  "d_m-sarimsoq": d_m_sarimsoq,
  "d_m-sayyoh-turist": d_m_sayyoh_turist,
  "d_m-sayyoh": d_m_sayyoh,
  "d_m-sekin": d_m_sekin,
  "d_m-senga-tanishtiraman": d_m_senga_tanishtiraman,
  "d_m-seni-bilan-tanishtiraman": d_m_seni_bilan_tanishtiraman,
  "d_m-shaharcha-shahar": d_m_shaharcha_shahar,
  "d_m-shaxmat": d_m_shaxmat,
  "d_m-shift": d_m_shift,
  "d_m-ship": d_m_ship,
  "d_m-shirin": d_m_shirin,
  "d_m-shoshilmoq": d_m_shoshilmoq,
  "d_m-sinfdosh": d_m_sinfdosh,
  "d_m-soat": d_m_soat,
  "d_m-sochiq": d_m_sochiq,
  "d_m-sogliq": d_m_sogliq,
  "d_m-sotib-olmoq": d_m_sotib_olmoq,
  "d_m-sport": d_m_sport,
  "d_m-stadion": d_m_stadion,
  "d_m-sugormoq": d_m_sugormoq,
  "d_m-sumka": d_m_sumka,
  "d_m-tanimoq": d_m_tanimoq,
  "d_m-tanishmoq-uchrashmoq": d_m_tanishmoq_uchrashmoq,
  "d_m-tanishmoq": d_m_tanishmoq,
  "d_m-tartibsiz-betartib": d_m_tartibsiz_betartib,
  "d_m-tartibsiz-sochilgan": d_m_tartibsiz_sochilgan,
  "d_m-tartibsiz": d_m_tartibsiz,
  "d_m-tartibsizlik": d_m_tartibsizlik,
  "d_m-tayyor": d_m_tayyor,
  "d_m-tennis": d_m_tennis,
  "d_m-tez": d_m_tez,
  "d_m-togriga": d_m_togriga,
  "d_m-tom": d_m_tom,
  "d_m-tortma": d_m_tortma,
  "d_m-totiqush": d_m_totiqush,
  "d_m-tozalamoq": d_m_tozalamoq,
  "d_m-tugamoq": d_m_tugamoq,
  "d_m-turmoq": d_m_turmoq,
  "d_m-tush-kormoq": d_m_tush_kormoq,
  "d_m-tush-payti": d_m_tush_payti,
  "d_m-tush": d_m_tush,
  "d_m-tushdan-keyin-kunduzi": d_m_tushdan_keyin_kunduzi,
  "d_m-tushdan-keyin": d_m_tushdan_keyin,
  "d_m-tushlik-qilmoq": d_m_tushlik_qilmoq,
  "d_m-tuvak": d_m_tuvak,
  "d_m-uchmoq-minib-sayr-qilmoq": d_m_uchmoq_minib_sayr_qilmoq,
  "d_m-uruglar-don": d_m_uruglar_don,
  "d_m-uruglar": d_m_uruglar,
  "d_m-ushlamoq-tutmoq": d_m_ushlamoq_tutmoq,
  "d_m-uxlashga-yotmoq": d_m_uxlashga_yotmoq,
  "d_m-uy-hayvoni": d_m_uy_hayvoni,
  "d_m-uy-vazifasi": d_m_uy_vazifasi,
  "d_m-uy-vazifasini-bajarmoq": d_m_uy_vazifasini_bajarmoq,
  "d_m-uy-xonadon": d_m_uy_xonadon,
  "d_m-uygonmoq": d_m_uygonmoq,
  "d_m-uzoq": d_m_uzoq,
  "d_m-uzoqda": d_m_uzoqda,
  "d_m-vaqt": d_m_vaqt,
  "d_m-vilka": d_m_vilka,
  "d_m-voleybol": d_m_voleybol,
  "d_m-xomyak": d_m_xomyak,
  "d_m-xush-kelibsiz": d_m_xush_kelibsiz,
  "d_m-yana-qaytadan": d_m_yana_qaytadan,
  "d_m-yangi-toza": d_m_yangi_toza,
  "d_m-yangi-uzilgan-toza": d_m_yangi_uzilgan_toza,
  "d_m-yaqinida-yaqin": d_m_yaqinida_yaqin,
  "d_m-yaqinida": d_m_yaqinida,
  "d_m-yashamoq": d_m_yashamoq,
  "d_m-yaxshi-mazali": d_m_yaxshi_mazali,
  "d_m-yem": d_m_yem,
  "d_m-yetib-kelmoq": d_m_yetib_kelmoq,
  "d_m-yigishtirmoq": d_m_yigishtirmoq,
  "d_m-yil": d_m_yil,
  "d_m-yongoq": d_m_yongoq,
  "d_m-yongoqlar": d_m_yongoqlar,
  "d_m-yonida-yaqinida": d_m_yonida_yaqinida,
  "d_m-yoqimtoy-chiroyli": d_m_yoqimtoy_chiroyli,
  "d_m-yoqimtoy-shirin": d_m_yoqimtoy_shirin,
  "d_m-yoqimtoy": d_m_yoqimtoy,
  "d_m-yorug": d_m_yorug,
  "d_m-yotmoq": d_m_yotmoq,
  "d_m-yuqorida": d_m_yuqorida,
  "d_m-adashgan": d_m_adashgan,
  "d_m-allo": d_m_allo,
  "d_m-amakivachcha-xolavachcha": d_m_amakivachcha_xolavachcha,
  "d_m-anana": d_m_anana,
  "d_m-ananaviy": d_m_ananaviy,
  "d_m-aqlli-zukko": d_m_aqlli_zukko,
  "d_m-aqlli": d_m_aqlli,
  "d_m-aralashtirmoq-kovlamoq": d_m_aralashtirmoq_kovlamoq,
  "d_m-aralashtirmoq": d_m_aralashtirmoq,
  "d_m-archa": d_m_archa,
  "d_m-argamchi": d_m_argamchi,
  "d_m-argimchoq": d_m_argimchoq,
  "d_m-arzon": d_m_arzon,
  "d_m-attraksionlar": d_m_attraksionlar,
  "d_m-avgust": d_m_avgust,
  "d_m-aynan-hozir": d_m_aynan_hozir,
  "d_m-ayni-damda": d_m_ayni_damda,
  "d_m-ayni-paytda-hozir": d_m_ayni_paytda_hozir,
  "d_m-ayni-paytda": d_m_ayni_paytda,
  "d_m-aytib-bermoq": d_m_aytib_bermoq,
  "d_m-badantarbiya-gimnastika": d_m_badantarbiya_gimnastika,
  "d_m-baland-boyli": d_m_baland_boyli,
  "d_m-baland-katta": d_m_baland_katta,
  "d_m-baliq-ovi": d_m_baliq_ovi,
  "d_m-bank": d_m_bank,
  "d_m-baqirmoq-qichqirmoq": d_m_baqirmoq_qichqirmoq,
  "d_m-baqirmoq": d_m_baqirmoq,
  "d_m-barglar": d_m_barglar,
  "d_m-bayram-qilmoq-nishonlamoq": d_m_bayram_qilmoq_nishonlamoq,
  "d_m-bazan": d_m_bazan,
  "d_m-bazm-ziyofat": d_m_bazm_ziyofat,
  "d_m-bekat-stansiya": d_m_bekat_stansiya,
  "d_m-bekinmachoq": d_m_bekinmachoq,
  "d_m-berkinmoq": d_m_berkinmoq,
  "d_m-bermoq": d_m_bermoq,
  "d_m-bezamoq": d_m_bezamoq,
  "d_m-bino": d_m_bino,
  "d_m-bobo-va-buvi": d_m_bobo_va_buvi,
  "d_m-bolak": d_m_bolak,
  "d_m-bolishmoq": d_m_bolishmoq,
  "d_m-bosh": d_m_bosh,
  "d_m-bozor": d_m_bozor,
  "d_m-bu-qancha-turadi": d_m_bu_qancha_turadi,
  "d_m-bugdoy": d_m_bugdoy,
  "d_m-burchak-muyulish": d_m_burchak_muyulish,
  "d_m-burchak": d_m_burchak,
  "d_m-buril": d_m_buril,
  "d_m-burilmoq": d_m_burilmoq,
  "d_m-buta": d_m_buta,
  "d_m-buterbrod": d_m_buterbrod,
  "d_m-chap-chapga": d_m_chap_chapga,
  "d_m-chapda-chapga": d_m_chapda_chapga,
  "d_m-chapga": d_m_chapga,
  "d_m-chaqirmoq-baqirmoq": d_m_chaqirmoq_baqirmoq,
  "d_m-chipta": d_m_chipta,
  "d_m-chomilmoq": d_m_chomilmoq,
  "d_m-chorraha": d_m_chorraha,
  "d_m-chunki": d_m_chunki,
  "d_m-dam-olmoq": d_m_dam_olmoq,
  "d_m-dan-oldin": d_m_dan_oldin,
  "d_m-dangasa": d_m_dangasa,
  "d_m-darsdan-keyin": d_m_darsdan_keyin,
  "d_m-dasturxon-tuzamoq": d_m_dasturxon_tuzamoq,
  "d_m-dasturxon": d_m_dasturxon,
  "d_m-davom-etmoq-yurib-ketmoq": d_m_davom_etmoq_yurib_ketmoq,
  "d_m-dekabr": d_m_dekabr,
  "d_m-doim-har-doim": d_m_doim_har_doim,
  "d_m-dutor": d_m_dutor,
  "d_m-ellik": d_m_ellik,
  "d_m-fasl": d_m_fasl,
  "d_m-faxrlanadigan-magrur": d_m_faxrlanadigan_magrur,
  "d_m-faxrlanuvchi-magrur": d_m_faxrlanuvchi_magrur,
  "d_m-fevral": d_m_fevral,
  "d_m-gaplashmoq": d_m_gaplashmoq,
  "d_m-gid-yolboshchi": d_m_gid_yolboshchi,
  "d_m-gid-yolboshlovchi": d_m_gid_yolboshlovchi,
  "d_m-gid": d_m_gid,
  "d_m-gimnastika": d_m_gimnastika,
  "d_m-guldasta": d_m_guldasta,
  "d_m-hazil-latifa": d_m_hazil_latifa,
  "d_m-hazil": d_m_hazil,
  "d_m-hech-qachon": d_m_hech_qachon,
  "d_m-hozir-qilyapti": d_m_hozir_qilyapti,
  "d_m-hozir": d_m_hozir,
  "d_m-idish-tovoq": d_m_idish_tovoq,
  "d_m-idish-yuvmoq": d_m_idish_yuvmoq,
  "d_m-iflos": d_m_iflos,
  "d_m-ishlamoq": d_m_ishlamoq,
  "d_m-itarmoq": d_m_itarmoq,
  "d_m-iyul": d_m_iyul,
  "d_m-jasur": d_m_jasur,
  "d_m-javob": d_m_javob,
  "d_m-jim-sokin": d_m_jim_sokin,
  "d_m-jim-sukunat": d_m_jim_sukunat,
  "d_m-jim-tinch": d_m_jim_tinch,
  "d_m-jim-tss": d_m_jim_tss,
  "d_m-jimlik": d_m_jimlik,
  "d_m-jingalak": d_m_jingalak,
  "d_m-jonatmoq": d_m_jonatmoq,
  "d_m-juda-haddan-tashqari": d_m_juda_haddan_tashqari,
  "d_m-jurnal": d_m_jurnal,
  "d_m-kakao": d_m_kakao,
  "d_m-kalendar-taqvim": d_m_kalendar_taqvim,
  "d_m-kerak-bolmoq-muhtoj-bolmoq": d_m_kerak_bolmoq_muhtoj_bolmoq,
  "d_m-keyin-song": d_m_keyin_song,
  "d_m-kochib-kelmoq": d_m_kochib_kelmoq,
  "d_m-kolmak": d_m_kolmak,
  "d_m-komiks": d_m_komiks,
  "d_m-kompot": d_m_kompot,
  "d_m-konvert": d_m_konvert,
  "d_m-korgani-bormoq-mehmonga-bormoq": d_m_korgani_bormoq_mehmonga_bormoq,
  "d_m-kozni-yummoq": d_m_kozni_yummoq,
  "d_m-kozoynak": d_m_kozoynak,
  "d_m-kulgili-hazilkash": d_m_kulgili_hazilkash,
  "d_m-kulgili-quvnoq": d_m_kulgili_quvnoq,
  "d_m-kulgili": d_m_kulgili,
  "d_m-kutib-olmoq": d_m_kutib_olmoq,
  "d_m-lager": d_m_lager,
  "d_m-latifa-hazil": d_m_latifa_hazil,
  "d_m-lenta-bant": d_m_lenta_bant,
  "d_m-lenta": d_m_lenta,
  "d_m-madhiya": d_m_madhiya,
  "d_m-madrasa": d_m_madrasa,
  "d_m-marhamat": d_m_marhamat,
  "d_m-marka": d_m_marka,
  "d_m-markaz": d_m_markaz,
  "d_m-mart": d_m_mart,
  "d_m-mashgulot": d_m_mashgulot,
  "d_m-masjid": d_m_masjid,
  "d_m-may": d_m_may,
  "d_m-maydon": d_m_maydon,
  "d_m-mehmon-bolib-bormoq-ziyorat-qilmoq": d_m_mehmon_bolib_bormoq_ziyorat_qilmoq,
  "d_m-mehmon": d_m_mehmon,
  "d_m-mehribon-xushmuomala": d_m_mehribon_xushmuomala,
  "d_m-mehribon": d_m_mehribon,
  "d_m-men-xohlardim": d_m_men_xohlardim,
  "d_m-metro-bekati": d_m_metro_bekati,
  "d_m-ming": d_m_ming,
  "d_m-mobil-telefon": d_m_mobil_telefon,
  "d_m-moqchi-edim": d_m_moqchi_edim,
  "d_m-multfilm": d_m_multfilm,
  "d_m-multfilmlar": d_m_multfilmlar,
  "d_m-murabbo": d_m_murabbo,
  "d_m-mushakbozlik-feyerverk": d_m_mushakbozlik_feyerverk,
  "d_m-mushakbozlik-salyut": d_m_mushakbozlik_salyut,
  "d_m-mushakbozlik": d_m_mushakbozlik,
  "d_m-musiqa-tinglamoq": d_m_musiqa_tinglamoq,
  "d_m-mustaqillik-kuni": d_m_mustaqillik_kuni,
  "d_m-mustaqillik": d_m_mustaqillik,
  "d_m-muyulish-burchak": d_m_muyulish_burchak,
  "d_m-narx": d_m_narx,
  "d_m-navroz": d_m_navroz,
  "d_m-ning-oxirida": d_m_ning_oxirida,
  "d_m-nishonlamoq-bayram-qilmoq": d_m_nishonlamoq_bayram_qilmoq,
  "d_m-nishonlamoq": d_m_nishonlamoq,
  "d_m-noyabr": d_m_noyabr,
  "d_m-och-rangli": d_m_och_rangli,
  "d_m-ochmoq": d_m_ochmoq,
  "d_m-odatda": d_m_odatda,
  "d_m-odobli": d_m_odobli,
  "d_m-ofis-idora": d_m_ofis_idora,
  "d_m-oktabr": d_m_oktabr,
  "d_m-oktyabr": d_m_oktyabr,
  "d_m-oldin": d_m_oldin,
  "d_m-omlet": d_m_omlet,
  "d_m-ong-ongga": d_m_ong_ongga,
  "d_m-ongda-ongga": d_m_ongda_ongga,
  "d_m-ongga": d_m_ongga,
  "d_m-oqimoq": d_m_oqimoq,
  "d_m-oqituvchilar-kuni": d_m_oqituvchilar_kuni,
  "d_m-oquv-yili": d_m_oquv_yili,
  "d_m-oquv-yilining-boshlanishi": d_m_oquv_yilining_boshlanishi,
  "d_m-oramoq": d_m_oramoq,
  "d_m-orindiq": d_m_orindiq,
  "d_m-ormon": d_m_ormon,
  "d_m-ortasida-orasida": d_m_ortasida_orasida,
  "d_m-ot-maysa": d_m_ot_maysa,
  "d_m-otirmoq": d_m_otirmoq,
  "d_m-otkritka": d_m_otkritka,
  "d_m-otlar-maysa": d_m_otlar_maysa,
  "d_m-ottiz": d_m_ottiz,
  "d_m-ovqat-pishirmoq": d_m_ovqat_pishirmoq,
  "d_m-ozgin-xipcha": d_m_ozgin_xipcha,
  "d_m-ozgin": d_m_ozgin,
  "d_m-paket": d_m_paket,
  "d_m-past-boyli": d_m_past_boyli,
  "d_m-past-kichik": d_m_past_kichik,
  "d_m-pechene": d_m_pechene,
  "d_m-pitsa": d_m_pitsa,
  "d_m-piyoda-yurmoq-sayr-qilmoq": d_m_piyoda_yurmoq_sayr_qilmoq,
  "d_m-pochta-qutisi": d_m_pochta_qutisi,
  "d_m-pochta": d_m_pochta,
  "d_m-yarim": d_m_yarim,
  "d_m-yutmoq": d_m_yutmoq,
  "d_m-yutqazmoq": d_m_yutqazmoq,
  "d_m-yuvinmoq": d_m_yuvinmoq,
  "d_m-yuvmoq": d_m_yuvmoq,
  "d_m-zamonaviy": d_m_zamonaviy,
  "d_m-zina": d_m_zina,
  "d_m-zinapoya": d_m_zinapoya,
};
/** Xonalar va darslar rasmlari birga — emoji/so'z bo'yicha topilgan id shu yerdan olinadi. */
// REV153: o'yinlar uchun chizilgan yulduz, quti, pufak — darsda ham (⭐ 📦 🫧)
export const JONLI_DARS = { j_yulduz: JR.yulduz, j_quti: JR.quti, j_pufak: JR.pufak };
export const RASM_HAMMA = { ...RASMLAR, ...DARS_RASM, ...JONLI_DARS };
