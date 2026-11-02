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
// REV244: rassomning 140 ta yangi rasmi (yetishmagan belgilar va sanash uchun bittalik narsalar)
import d_y_clockwise_rightwards_and_leftwards_open_circle_arrows from "./dars/rasm/y-clockwise-rightwards-and-leftwards-open-circle-arrows.webp";
import d_y_heavy_black_heart from "./dars/rasm/y-heavy-black-heart.webp";
import d_y_clapping_hands_sign from "./dars/rasm/y-clapping-hands-sign.webp";
import d_y_black_rightwards_arrow from "./dars/rasm/y-black-rightwards-arrow.webp";
import d_y_thinking_face from "./dars/rasm/y-thinking-face.webp";
import d_y_performing_arts from "./dars/rasm/y-performing-arts.webp";
import d_y_thumbs_up_sign from "./dars/rasm/y-thumbs-up-sign.webp";
import d_y_input_symbol_for_numbers from "./dars/rasm/y-input-symbol-for-numbers.webp";
import d_y_handshake from "./dars/rasm/y-handshake.webp";
import d_y_raised_hand from "./dars/rasm/y-raised-hand.webp";
import d_y_elephant from "./dars/rasm/y-elephant.webp";
import d_y_upwards_black_arrow from "./dars/rasm/y-upwards-black-arrow.webp";
import d_y_leftwards_black_arrow from "./dars/rasm/y-leftwards-black-arrow.webp";
import d_y_pilot from "./dars/rasm/y-pilot.webp";
import d_y_basketball_and_hoop from "./dars/rasm/y-basketball-and-hoop.webp";
import d_y_heavy_minus_sign from "./dars/rasm/y-heavy-minus-sign.webp";
import d_y_farmer from "./dars/rasm/y-farmer.webp";
import d_y_sun_with_face from "./dars/rasm/y-sun-with-face.webp";
import d_y_open_hands_sign from "./dars/rasm/y-open-hands-sign.webp";
import d_y_raised_hand_with_fingers_splayed from "./dars/rasm/y-raised-hand-with-fingers-splayed.webp";
import d_y_no_entry_sign from "./dars/rasm/y-no-entry-sign.webp";
import d_y_beach_with_umbrella from "./dars/rasm/y-beach-with-umbrella.webp";
import d_y_train from "./dars/rasm/y-train.webp";
import d_y_spider from "./dars/rasm/y-spider.webp";
import d_y_multiple_musical_notes from "./dars/rasm/y-multiple-musical-notes.webp";
import d_y_sparkles from "./dars/rasm/y-sparkles.webp";
import d_y_cow from "./dars/rasm/y-cow.webp";
import d_y_snowman_without_snow from "./dars/rasm/y-snowman-without-snow.webp";
import d_y_heart_with_ribbon from "./dars/rasm/y-heart-with-ribbon.webp";
import d_y_railway_car from "./dars/rasm/y-railway-car.webp";
import d_y_left_pointing_magnifying_glass from "./dars/rasm/y-left-pointing-magnifying-glass.webp";
import d_y_jigsaw_puzzle_piece from "./dars/rasm/y-jigsaw-puzzle-piece.webp";
import d_y_downwards_black_arrow from "./dars/rasm/y-downwards-black-arrow.webp";
import d_y_heavy_plus_sign from "./dars/rasm/y-heavy-plus-sign.webp";
import d_y_anticlockwise_downwards_and_upwards_open_circle_arrows from "./dars/rasm/y-anticlockwise-downwards-and-upwards-open-circle-arrows.webp";
import d_y_trophy from "./dars/rasm/y-trophy.webp";
import d_y_goal_net from "./dars/rasm/y-goal-net.webp";
import d_y_rabbit from "./dars/rasm/y-rabbit.webp";
import d_y_raised_back_of_hand from "./dars/rasm/y-raised-back-of-hand.webp";
import d_y_back_with_leftwards_arrow_above from "./dars/rasm/y-back-with-leftwards-arrow-above.webp";
import d_y_heavy_equals_sign from "./dars/rasm/y-heavy-equals-sign.webp";
import d_y_heavy_large_circle from "./dars/rasm/y-heavy-large-circle.webp";
import d_y_juggling from "./dars/rasm/y-juggling.webp";
import d_y_family from "./dars/rasm/y-family.webp";
import d_y_horse from "./dars/rasm/y-horse.webp";
import d_y_black_large_square from "./dars/rasm/y-black-large-square.webp";
import d_y_white_left_pointing_backhand_index from "./dars/rasm/y-white-left-pointing-backhand-index.webp";
import d_y_microscope from "./dars/rasm/y-microscope.webp";
import d_y_black_square_button from "./dars/rasm/y-black-square-button.webp";
import d_y_white_hexagon from "./dars/rasm/y-white-hexagon.webp";
import d_y_sleuth_or_spy from "./dars/rasm/y-sleuth-or-spy.webp";
import d_y_new_moon_symbol from "./dars/rasm/y-new-moon-symbol.webp";
import d_y_chopsticks from "./dars/rasm/y-chopsticks.webp";
import d_y_victory_hand from "./dars/rasm/y-victory-hand.webp";
import d_y_black_pentagon from "./dars/rasm/y-black-pentagon.webp";
import d_y_umbrella_with_rain_drops from "./dars/rasm/y-umbrella-with-rain-drops.webp";
import d_y_shortcake from "./dars/rasm/y-shortcake.webp";
import d_y_white_down_pointing_backhand_index from "./dars/rasm/y-white-down-pointing-backhand-index.webp";
import d_y_shopping_bags from "./dars/rasm/y-shopping-bags.webp";
import d_y_horse_racing from "./dars/rasm/y-horse-racing.webp";
import d_y_face_with_stuck_out_tongue_and_tightly_closed_eyes from "./dars/rasm/y-face-with-stuck-out-tongue-and-tightly-closed-eyes.webp";
import d_y_white_up_pointing_backhand_index from "./dars/rasm/y-white-up-pointing-backhand-index.webp";
import d_y_speaking_head_in_silhouette from "./dars/rasm/y-speaking-head-in-silhouette.webp";
import d_y_chains from "./dars/rasm/y-chains.webp";
import d_y_mechanic from "./dars/rasm/y-mechanic.webp";
import d_y_face_with_open_mouth from "./dars/rasm/y-face-with-open-mouth.webp";
import d_y_white_chess_knight from "./dars/rasm/y-white-chess-knight.webp";
import d_y_hammer_and_wrench from "./dars/rasm/y-hammer-and-wrench.webp";
import d_y_white_chess_rook from "./dars/rasm/y-white-chess-rook.webp";
import d_y_thong_sandal from "./dars/rasm/y-thong-sandal.webp";
import d_y_face_without_mouth from "./dars/rasm/y-face-without-mouth.webp";
import d_y_face_with_tears_of_joy from "./dars/rasm/y-face-with-tears-of-joy.webp";
import d_y_chequered_flag from "./dars/rasm/y-chequered-flag.webp";
import d_y_white_chess_bishop from "./dars/rasm/y-white-chess-bishop.webp";
import d_y_large_blue_diamond from "./dars/rasm/y-large-blue-diamond.webp";
import d_y_tennis_racquet_and_ball from "./dars/rasm/y-tennis-racquet-and-ball.webp";
import d_y_bar_chart from "./dars/rasm/y-bar-chart.webp";
import d_y_hair_pick from "./dars/rasm/y-hair-pick.webp";
import d_y_top_hat from "./dars/rasm/y-top-hat.webp";
import d_y_clipboard from "./dars/rasm/y-clipboard.webp";
import d_y_black_chess_pawn from "./dars/rasm/y-black-chess-pawn.webp";
import d_y_grinning_face_with_one_large_and_one_small_eye from "./dars/rasm/y-grinning-face-with-one-large-and-one-small-eye.webp";
import d_y_raised_hand_with_part_between_middle_and_ring_fingers from "./dars/rasm/y-raised-hand-with-part-between-middle-and-ring-fingers.webp";
import d_y_womans_clothes from "./dars/rasm/y-womans-clothes.webp";
import d_y_battery from "./dars/rasm/y-battery.webp";
import d_y_twisted_rightwards_arrows from "./dars/rasm/y-twisted-rightwards-arrows.webp";
import d_y_polar_bear from "./dars/rasm/y-polar-bear.webp";
import d_y_curly_loop from "./dars/rasm/y-curly-loop.webp";
import d_y_persevering_face from "./dars/rasm/y-persevering-face.webp";
import d_y_pirate_flag from "./dars/rasm/y-pirate-flag.webp";
import d_y_christmas_tree from "./dars/rasm/y-christmas-tree.webp";
import d_y_open_lock from "./dars/rasm/y-open-lock.webp";
import d_y_white_chess_king from "./dars/rasm/y-white-chess-king.webp";
import d_y_palm_down_hand from "./dars/rasm/y-palm-down-hand.webp";
import d_y_candle from "./dars/rasm/y-candle.webp";
import d_y_hot_dog from "./dars/rasm/y-hot-dog.webp";
import d_y_woman_with_bunny_ears from "./dars/rasm/y-woman-with-bunny-ears.webp";
import d_y_file_cabinet from "./dars/rasm/y-file-cabinet.webp";
import d_y_lab_coat from "./dars/rasm/y-lab-coat.webp";
import d_y_toolbox from "./dars/rasm/y-toolbox.webp";
import d_y_no_mobile_phones from "./dars/rasm/y-no-mobile-phones.webp";
import d_y_tired_face from "./dars/rasm/y-tired-face.webp";
import d_y_disappointed_face from "./dars/rasm/y-disappointed-face.webp";
import d_y_white_chess_queen from "./dars/rasm/y-white-chess-queen.webp";
import d_y_white_chess_pawn from "./dars/rasm/y-white-chess-pawn.webp";
import d_y_heavy_multiplication_x from "./dars/rasm/y-heavy-multiplication-x.webp";
import d_y_shield from "./dars/rasm/y-shield.webp";
import d_y_hammer from "./dars/rasm/y-hammer.webp";
import d_y_carpentry_saw from "./dars/rasm/y-carpentry-saw.webp";
import d_y_grinning_face_with_smiling_eyes from "./dars/rasm/y-grinning-face-with-smiling-eyes.webp";
import d_y_upside_down_face from "./dars/rasm/y-upside-down-face.webp";
import d_y_mans_shoe from "./dars/rasm/y-mans-shoe.webp";
import d_y_radio_button from "./dars/rasm/y-radio-button.webp";
import d_y_circus_tent from "./dars/rasm/y-circus-tent.webp";
import d_y_end_with_leftwards_arrow_above from "./dars/rasm/y-end-with-leftwards-arrow-above.webp";
import d_y_recreational_vehicle from "./dars/rasm/y-recreational-vehicle.webp";
import d_y_heavy_exclamation_mark_symbol from "./dars/rasm/y-heavy-exclamation-mark-symbol.webp";
import d_y_building_construction from "./dars/rasm/y-building-construction.webp";
import d_y_amphora from "./dars/rasm/y-amphora.webp";
import d_y_single_block from "./dars/rasm/y-single-block.webp";
import d_y_single_sock from "./dars/rasm/y-single-sock.webp";
import d_y_single_sneaker from "./dars/rasm/y-single-sneaker.webp";
import d_y_single_glove from "./dars/rasm/y-single-glove.webp";
import d_y_single_coin from "./dars/rasm/y-single-coin.webp";
import d_y_single_cherry from "./dars/rasm/y-single-cherry.webp";
import d_y_single_grape from "./dars/rasm/y-single-grape.webp";
import d_y_grape_bunch from "./dars/rasm/y-grape-bunch.webp";
import d_y_single_colored_pencil from "./dars/rasm/y-single-colored-pencil.webp";
import d_y_single_stick from "./dars/rasm/y-single-stick.webp";
import d_y_whole_leg from "./dars/rasm/y-whole-leg.webp";
import d_y_single_chair from "./dars/rasm/y-single-chair.webp";
import d_y_question_mark from "./dars/rasm/y-question-mark.webp";
import d_y_check_mark from "./dars/rasm/y-check-mark.webp";
import d_y_cross_mark from "./dars/rasm/y-cross-mark.webp";
import d_y_number_2_swan from "./dars/rasm/y-number-2-swan.webp";
import d_y_number_3_bird from "./dars/rasm/y-number-3-bird.webp";
import d_y_number_1_card from "./dars/rasm/y-number-1-card.webp";
import d_y_number_2_card from "./dars/rasm/y-number-2-card.webp";
import d_y_number_3_card from "./dars/rasm/y-number-3-card.webp";
import d_y_single_boy from "./dars/rasm/y-single-boy.webp";
// REV259: rassomning 625 ta yangi rasmi — 225 ta javob varianti (v-…) va 400 ta bog'cha rasmi
import d_v_1_ta_doira from "./dars/rasm/v-1-ta-doira.webp";
import d_v_1_ta from "./dars/rasm/v-1-ta.webp";
import d_v_2_qadam from "./dars/rasm/v-2-qadam.webp";
import d_v_2_ta from "./dars/rasm/v-2-ta.webp";
import d_v_4_qadam from "./dars/rasm/v-4-qadam.webp";
import d_v_4_ta_doira from "./dars/rasm/v-4-ta-doira.webp";
import d_v_4_ta from "./dars/rasm/v-4-ta.webp";
import d_v_a_comb from "./dars/rasm/v-a-comb.webp";
import d_v_aniq_belgidan from "./dars/rasm/v-aniq-belgidan.webp";
import d_v_aniq_bilganlarimizni from "./dars/rasm/v-aniq-bilganlarimizni.webp";
import d_v_artinamiz from "./dars/rasm/v-artinamiz.webp";
import d_v_artinishga from "./dars/rasm/v-artinishga.webp";
import d_v_artish from "./dars/rasm/v-artish.webp";
import d_v_aylanib from "./dars/rasm/v-aylanib.webp";
import d_v_barmoq_bilan_kuzatib from "./dars/rasm/v-barmoq-bilan-kuzatib.webp";
import d_v_bazi from "./dars/rasm/v-bazi.webp";
import d_v_bir_qarab from "./dars/rasm/v-bir-qarab.webp";
import d_v_bir_xil from "./dars/rasm/v-bir-xil.webp";
import d_v_biri_ogir from "./dars/rasm/v-biri-ogir.webp";
import d_v_boshida from "./dars/rasm/v-boshida.webp";
import d_v_bright from "./dars/rasm/v-bright.webp";
import d_v_bugdoydan from "./dars/rasm/v-bugdoydan.webp";
import d_v_burchakli from "./dars/rasm/v-burchakli.webp";
import d_v_can_be_seen from "./dars/rasm/v-can-be-seen.webp";
import d_v_chap_kabi from "./dars/rasm/v-chap-kabi.webp";
import d_v_chap_va_ongga_qaraymiz from "./dars/rasm/v-chap-va-ongga-qaraymiz.webp";
import d_v_chiqarib_tashlaymiz from "./dars/rasm/v-chiqarib-tashlaymiz.webp";
import d_v_chiroyli_shapka_uchun from "./dars/rasm/v-chiroyli-shapka-uchun.webp";
import d_v_chtoby_est from "./dars/rasm/v-chtoby-est.webp";
import d_v_dadam from "./dars/rasm/v-dadam.webp";
import d_v_dadamniki from "./dars/rasm/v-dadamniki.webp";
import d_v_devordan_sakraymiz from "./dars/rasm/v-devordan-sakraymiz.webp";
import d_v_diqqat_bilan_qaraymiz from "./dars/rasm/v-diqqat-bilan-qaraymiz.webp";
import d_v_disappears from "./dars/rasm/v-disappears.webp";
import d_v_dlya_sveta from "./dars/rasm/v-dlya-sveta.webp";
import d_v_dry from "./dars/rasm/v-dry.webp";
import d_v_drying from "./dars/rasm/v-drying.webp";
import d_v_dumaloq from "./dars/rasm/v-dumaloq.webp";
import d_v_eng_tepada from "./dars/rasm/v-eng-tepada.webp";
import d_v_eriydi from "./dars/rasm/v-eriydi.webp";
import d_v_est from "./dars/rasm/v-est.webp";
import d_v_flower_juice from "./dars/rasm/v-flower-juice.webp";
import d_v_gul_shirasidan from "./dars/rasm/v-gul-shirasidan.webp";
import d_v_hamma from "./dars/rasm/v-hamma.webp";
import d_v_hammasi_teng from "./dars/rasm/v-hammasi-teng.webp";
import d_v_har_xil from "./dars/rasm/v-har-xil.webp";
import d_v_havo from "./dars/rasm/v-havo.webp";
import d_v_hech_kim from "./dars/rasm/v-hech-kim.webp";
import d_v_hech_kimniki from "./dars/rasm/v-hech-kimniki.webp";
import d_v_hech_narsa from "./dars/rasm/v-hech-narsa.webp";
import d_v_hech_narsani from "./dars/rasm/v-hech-narsani.webp";
import d_v_hovlida from "./dars/rasm/v-hovlida.webp";
import d_v_ikki_marta from "./dars/rasm/v-ikki-marta.webp";
import d_v_in_a_barn from "./dars/rasm/v-in-a-barn.webp";
import d_v_in_a_kennel from "./dars/rasm/v-in-a-kennel.webp";
import d_v_in_the_dark from "./dars/rasm/v-in-the-dark.webp";
import d_v_in_the_light from "./dars/rasm/v-in-the-light.webp";
import d_v_in_water_and_on_the_shore from "./dars/rasm/v-in-water-and-on-the-shore.webp";
import d_v_it_is_not_fruit from "./dars/rasm/v-it-is-not-fruit.webp";
import d_v_iz_soka_tsvetov from "./dars/rasm/v-iz-soka-tsvetov.webp";
import d_v_joyi from "./dars/rasm/v-joyi.webp";
import d_v_juft from "./dars/rasm/v-juft.webp";
import d_v_kam from "./dars/rasm/v-kam.webp";
import d_v_kamayadi from "./dars/rasm/v-kamayadi.webp";
import d_v_katta_qizil from "./dars/rasm/v-katta-qizil.webp";
import d_v_katta_yashil from "./dars/rasm/v-katta-yashil.webp";
import d_v_kattalashadi from "./dars/rasm/v-kattalashadi.webp";
import d_v_kattaligida from "./dars/rasm/v-kattaligida.webp";
import d_v_kecha from "./dars/rasm/v-kecha.webp";
import d_v_kichik_kok from "./dars/rasm/v-kichik-kok.webp";
import d_v_kichik_qizil from "./dars/rasm/v-kichik-qizil.webp";
import d_v_kiyamiz from "./dars/rasm/v-kiyamiz.webp";
import d_v_kopayadi from "./dars/rasm/v-kopayadi.webp";
import d_v_korinadi from "./dars/rasm/v-korinadi.webp";
import d_v_kotariladi from "./dars/rasm/v-kotariladi.webp";
import d_v_koz_yumib from "./dars/rasm/v-koz-yumib.webp";
import d_v_kozni_yumamiz from "./dars/rasm/v-kozni-yumamiz.webp";
import d_v_krysha from "./dars/rasm/v-krysha.webp";
import d_v_kunduzi_oyinda from "./dars/rasm/v-kunduzi-oyinda.webp";
import d_v_kuzda from "./dars/rasm/v-kuzda.webp";
import d_v_kvadrat_yoki_tortburchak from "./dars/rasm/v-kvadrat-yoki-tortburchak.webp";
import d_v_look_carefully from "./dars/rasm/v-look-carefully.webp";
import d_v_meniki from "./dars/rasm/v-meniki.webp";
import d_v_mesto from "./dars/rasm/v-mesto.webp";
import d_v_meva_emas from "./dars/rasm/v-meva-emas.webp";
import d_v_meva_turi from "./dars/rasm/v-meva-turi.webp";
import d_v_molxonada from "./dars/rasm/v-molxonada.webp";
import d_v_muzlatgichda from "./dars/rasm/v-muzlatgichda.webp";
import d_v_muzlaydi from "./dars/rasm/v-muzlaydi.webp";
import d_v_na_nogu from "./dars/rasm/v-na-nogu.webp";
import d_v_na_ruku from "./dars/rasm/v-na-ruku.webp";
import d_v_na_svetu from "./dars/rasm/v-na-svetu.webp";
import d_v_nadevaem from "./dars/rasm/v-nadevaem.webp";
import d_v_narsaning_ishiga from "./dars/rasm/v-narsaning-ishiga.webp";
import d_v_ne_frukt from "./dars/rasm/v-ne-frukt.webp";
import d_v_net_smeshno from "./dars/rasm/v-net-smeshno.webp";
import d_v_net_tolko_tyomnaya from "./dars/rasm/v-net-tolko-tyomnaya.webp";
import d_v_nichego from "./dars/rasm/v-nichego.webp";
import d_v_nothing from "./dars/rasm/v-nothing.webp";
import d_v_notogri from "./dars/rasm/v-notogri.webp";
import d_v_novvoy from "./dars/rasm/v-novvoy.webp";
import d_v_ogirligi_teng from "./dars/rasm/v-ogirligi-teng.webp";
import d_v_ogriydi from "./dars/rasm/v-ogriydi.webp";
import d_v_olcham from "./dars/rasm/v-olcham.webp";
import d_v_oldingda from "./dars/rasm/v-oldingda.webp";
import d_v_olma_yoqoldi from "./dars/rasm/v-olma-yoqoldi.webp";
import d_v_olmadan from "./dars/rasm/v-olmadan.webp";
import d_v_on_the_foot from "./dars/rasm/v-on-the-foot.webp";
import d_v_on_the_hand from "./dars/rasm/v-on-the-hand.webp";
import d_v_oq_qora from "./dars/rasm/v-oq-qora.webp";
import d_v_orqaga_qaytamiz from "./dars/rasm/v-orqaga-qaytamiz.webp";
import d_v_orqaga_yotamiz from "./dars/rasm/v-orqaga-yotamiz.webp";
import d_v_orqangda from "./dars/rasm/v-orqangda.webp";
import d_v_ortada from "./dars/rasm/v-ortada.webp";
import d_v_osadi from "./dars/rasm/v-osadi.webp";
import d_v_osha_tomon_kop from "./dars/rasm/v-osha-tomon-kop.webp";
import d_v_osib_ketadi from "./dars/rasm/v-osib-ketadi.webp";
import d_v_oson_topamiz from "./dars/rasm/v-oson-topamiz.webp";
import d_v_otamiz from "./dars/rasm/v-otamiz.webp";
import d_v_ovoz from "./dars/rasm/v-ovoz.webp";
import d_v_ovqat_va_suv from "./dars/rasm/v-ovqat-va-suv.webp";
import d_v_ovqat_yeyishga from "./dars/rasm/v-ovqat-yeyishga.webp";
import d_v_ovqat_yeymiz from "./dars/rasm/v-ovqat-yeymiz.webp";
import d_v_oxirgi_meva from "./dars/rasm/v-oxirgi-meva.webp";
import d_v_oxirida from "./dars/rasm/v-oxirida.webp";
import d_v_oynashga from "./dars/rasm/v-oynashga.webp";
import d_v_oyoqqa from "./dars/rasm/v-oyoqqa.webp";
import d_v_ozgarmaydi from "./dars/rasm/v-ozgarmaydi.webp";
import d_v_ozim from "./dars/rasm/v-ozim.webp";
import d_v_pastga_tushadi from "./dars/rasm/v-pastga-tushadi.webp";
import d_v_posmeyomsya from "./dars/rasm/v-posmeyomsya.webp";
import d_v_propadaet from "./dars/rasm/v-propadaet.webp";
import d_v_qadamini_sanab from "./dars/rasm/v-qadamini-sanab.webp";
import d_v_qaynaydi from "./dars/rasm/v-qaynaydi.webp";
import d_v_qismma_qism from "./dars/rasm/v-qismma-qism.webp";
import d_v_qiyshayadi from "./dars/rasm/v-qiyshayadi.webp";
import d_v_qoidani from "./dars/rasm/v-qoidani.webp";
import d_v_qolga from "./dars/rasm/v-qolga.webp";
import d_v_qolgan_odamniki from "./dars/rasm/v-qolgan-odamniki.webp";
import d_v_qoqilishga from "./dars/rasm/v-qoqilishga.webp";
import d_v_qorongida from "./dars/rasm/v-qorongida.webp";
import d_v_qoshiqqa from "./dars/rasm/v-qoshiqqa.webp";
import d_v_qumdan from "./dars/rasm/v-qumdan.webp";
import d_v_quruq from "./dars/rasm/v-quruq.webp";
import d_v_quyoshda from "./dars/rasm/v-quyoshda.webp";
import d_v_rangida from "./dars/rasm/v-rangida.webp";
import d_v_rangiga_qarab from "./dars/rasm/v-rangiga-qarab.webp";
import d_v_rangiga from "./dars/rasm/v-rangiga.webp";
import d_v_rangni from "./dars/rasm/v-rangni.webp";
import d_v_raschyoskoy from "./dars/rasm/v-raschyoskoy.webp";
import d_v_sababini from "./dars/rasm/v-sababini.webp";
import d_v_sariq_qizil from "./dars/rasm/v-sariq-qizil.webp";
import d_v_seshanba from "./dars/rasm/v-seshanba.webp";
import d_v_shakl from "./dars/rasm/v-shakl.webp";
import d_v_shanba from "./dars/rasm/v-shanba.webp";
import d_v_shippak from "./dars/rasm/v-shippak.webp";
import d_v_slippers from "./dars/rasm/v-slippers.webp";
import d_v_soglom_bolsin from "./dars/rasm/v-soglom-bolsin.webp";
import d_v_soliydi from "./dars/rasm/v-soliydi.webp";
import d_v_stakan from "./dars/rasm/v-stakan.webp";
import d_v_suhaya from "./dars/rasm/v-suhaya.webp";
import d_v_suvda_va_qirgoqda from "./dars/rasm/v-suvda-va-qirgoqda.webp";
import d_v_suvdan_tashqarida from "./dars/rasm/v-suvdan-tashqarida.webp";
import d_v_svetlaya from "./dars/rasm/v-svetlaya.webp";
import d_v_tanlaymiz from "./dars/rasm/v-tanlaymiz.webp";
import d_v_tarog_bilan from "./dars/rasm/v-tarog-bilan.webp";
import d_v_tashqarida from "./dars/rasm/v-tashqarida.webp";
import d_v_tasodifiylarni from "./dars/rasm/v-tasodifiylarni.webp";
import d_v_taxmindan from "./dars/rasm/v-taxmindan.webp";
import d_v_teng_emas from "./dars/rasm/v-teng-emas.webp";
import d_v_teng_turadi from "./dars/rasm/v-teng-turadi.webp";
import d_v_teng from "./dars/rasm/v-teng.webp";
import d_v_tepa from "./dars/rasm/v-tepa.webp";
import d_v_tepada from "./dars/rasm/v-tepada.webp";
import d_v_tepaga_chiqadi from "./dars/rasm/v-tepaga-chiqadi.webp";
import d_v_the_apple_disappeared from "./dars/rasm/v-the-apple-disappeared.webp";
import d_v_togri_tortburchak from "./dars/rasm/v-togri-tortburchak.webp";
import d_v_togri from "./dars/rasm/v-togri.webp";
import d_v_tola from "./dars/rasm/v-tola.webp";
import d_v_tortburchak from "./dars/rasm/v-tortburchak.webp";
import d_v_toxtab_oylaymiz from "./dars/rasm/v-toxtab-oylaymiz.webp";
import d_v_toxtaymiz from "./dars/rasm/v-toxtaymiz.webp";
import d_v_tuxumda from "./dars/rasm/v-tuxumda.webp";
import d_v_uchib_ketadi from "./dars/rasm/v-uchib-ketadi.webp";
import d_v_uchinchi from "./dars/rasm/v-uchinchi.webp";
import d_v_undan from "./dars/rasm/v-undan.webp";
import d_v_ustidan_sakrab_yiqilib from "./dars/rasm/v-ustidan-sakrab-yiqilib.webp";
import d_v_uychada from "./dars/rasm/v-uychada.webp";
import d_v_uyning_ichidasan from "./dars/rasm/v-uyning-ichidasan.webp";
import d_v_uyning_tashqarisidasan from "./dars/rasm/v-uyning-tashqarisidasan.webp";
import d_v_v_budke from "./dars/rasm/v-v-budke.webp";
import d_v_v_korovnike from "./dars/rasm/v-v-korovnike.webp";
import d_v_v_tapochkah from "./dars/rasm/v-v-tapochkah.webp";
import d_v_v_temnote from "./dars/rasm/v-v-temnote.webp";
import d_v_v_vode_i_na_beregu from "./dars/rasm/v-v-vode-i-na-beregu.webp";
import d_v_vidno from "./dars/rasm/v-vidno.webp";
import d_v_vnimatelno_smotret from "./dars/rasm/v-vnimatelno-smotret.webp";
import d_v_vytiraemsya from "./dars/rasm/v-vytiraemsya.webp";
import d_v_vytirat from "./dars/rasm/v-vytirat.webp";
import d_v_vytiratsya from "./dars/rasm/v-vytiratsya.webp";
import d_v_we_dry from "./dars/rasm/v-we-dry.webp";
import d_v_wear_it from "./dars/rasm/v-wear-it.webp";
import d_v_yabloko_propalo from "./dars/rasm/v-yabloko-propalo.webp";
import d_v_yangi_barg_chiqadi from "./dars/rasm/v-yangi-barg-chiqadi.webp";
import d_v_yashnaydi from "./dars/rasm/v-yashnaydi.webp";
import d_v_yer_osti from "./dars/rasm/v-yer-osti.webp";
import d_v_yer_ostida from "./dars/rasm/v-yer-ostida.webp";
import d_v_yer from "./dars/rasm/v-yer.webp";
import d_v_yeyish_uchun from "./dars/rasm/v-yeyish-uchun.webp";
import d_v_yeyish from "./dars/rasm/v-yeyish.webp";
import d_v_yomgirdan_keyin from "./dars/rasm/v-yomgirdan-keyin.webp";
import d_v_yon_tomonga_buriliamiz from "./dars/rasm/v-yon-tomonga-buriliamiz.webp";
import d_v_yoq_bitta from "./dars/rasm/v-yoq-bitta.webp";
import d_v_yoq_faqat_qora from "./dars/rasm/v-yoq-faqat-qora.webp";
import d_v_yoq_kulgili from "./dars/rasm/v-yoq-kulgili.webp";
import d_v_yoq_olchash_kerak from "./dars/rasm/v-yoq-olchash-kerak.webp";
import d_v_yoq_pingvin_uchmaydi from "./dars/rasm/v-yoq-pingvin-uchmaydi.webp";
import d_v_yoqoladi from "./dars/rasm/v-yoqoladi.webp";
import d_v_yoruglik_uchun from "./dars/rasm/v-yoruglik-uchun.webp";
import d_v_yotqizsa_ha from "./dars/rasm/v-yotqizsa-ha.webp";
import d_v_yovvoyi_hayvon from "./dars/rasm/v-yovvoyi-hayvon.webp";
import d_v_yovvoyi from "./dars/rasm/v-yovvoyi.webp";
import d_v_yuqori_va_past_orasida from "./dars/rasm/v-yuqori-va-past-orasida.webp";
import d_v_yuqori from "./dars/rasm/v-yuqori.webp";
import d_v_zakryto from "./dars/rasm/v-zakryto.webp";
import d_mt67_u3_came_plus from "./dars/rasm/mt67-u3-came-plus.webp";
import d_mt67_u3_check from "./dars/rasm/mt67-u3-check.webp";
import d_mt67_u3_count_back_sub from "./dars/rasm/mt67-u3-count-back-sub.webp";
import d_mt67_u3_from_ten from "./dars/rasm/mt67-u3-from-ten.webp";
import d_mt67_u3_left_minus from "./dars/rasm/mt67-u3-left-minus.webp";
import d_mt67_u3_minus_all from "./dars/rasm/mt67-u3-minus-all.webp";
import d_mt67_u3_minus_one from "./dars/rasm/mt67-u3-minus-one.webp";
import d_mt67_u3_minus from "./dars/rasm/mt67-u3-minus.webp";
import d_mt67_u3_taking_away from "./dars/rasm/mt67-u3-taking-away.webp";
import d_mt67_u4_altogether from "./dars/rasm/mt67-u4-altogether.webp";
import d_mt67_u4_ate from "./dars/rasm/mt67-u4-ate.webp";
import d_mt67_u4_check_answer from "./dars/rasm/mt67-u4-check-answer.webp";
import d_mt67_u4_condition from "./dars/rasm/mt67-u4-condition.webp";
import d_mt67_u4_how_many_left from "./dars/rasm/mt67-u4-how-many-left.webp";
import d_mt67_u4_make_problem from "./dars/rasm/mt67-u4-make-problem.webp";
import d_mt67_u4_more_came from "./dars/rasm/mt67-u4-more-came.webp";
import d_mt67_u4_question from "./dars/rasm/mt67-u4-question.webp";
import d_mt67_u4_story_from_sum from "./dars/rasm/mt67-u4-story-from-sum.webp";
import d_mt67_u5_corner_side from "./dars/rasm/mt67-u5-corner-side.webp";
import d_mt67_u5_equal_parts from "./dars/rasm/mt67-u5-equal-parts.webp";
import d_mt67_u5_four_quarters from "./dars/rasm/mt67-u5-four-quarters.webp";
import d_mt67_u5_hexagon from "./dars/rasm/mt67-u5-hexagon.webp";
import d_mt67_u5_pentagon from "./dars/rasm/mt67-u5-pentagon.webp";
import d_mt67_u5_rectangle from "./dars/rasm/mt67-u5-rectangle.webp";
import d_mt67_u5_whole from "./dars/rasm/mt67-u5-whole.webp";
import d_mt67_u6_autumn_months from "./dars/rasm/mt67-u6-autumn-months.webp";
import d_mt67_u6_clock_face from "./dars/rasm/mt67-u6-clock-face.webp";
import d_mt67_u6_eight_oclock from "./dars/rasm/mt67-u6-eight-oclock.webp";
import d_mt67_u6_hour_hand from "./dars/rasm/mt67-u6-hour-hand.webp";
import d_mt67_u6_minute_hand from "./dars/rasm/mt67-u6-minute-hand.webp";
import d_mt67_u6_oclock from "./dars/rasm/mt67-u6-oclock.webp";
import d_mt67_u6_spring_months from "./dars/rasm/mt67-u6-spring-months.webp";
import d_mt67_u6_summer_months from "./dars/rasm/mt67-u6-summer-months.webp";
import d_mt67_u6_three_oclock from "./dars/rasm/mt67-u6-three-oclock.webp";
import d_mt67_u6_winter_months from "./dars/rasm/mt67-u6-winter-months.webp";
import d_mt67_u7_cell from "./dars/rasm/mt67-u7-cell.webp";
import d_mt67_u7_change from "./dars/rasm/mt67-u7-change.webp";
import d_mt67_u7_coin_100 from "./dars/rasm/mt67-u7-coin-100.webp";
import d_mt67_u7_coin_200_500 from "./dars/rasm/mt67-u7-coin-200-500.webp";
import d_mt67_u7_graphic_dictation from "./dars/rasm/mt67-u7-graphic-dictation.webp";
import d_mt67_u7_grid_direction from "./dars/rasm/mt67-u7-grid-direction.webp";
import d_mt67_u7_grid_pattern from "./dars/rasm/mt67-u7-grid-pattern.webp";
import d_mt67_u7_hands_side from "./dars/rasm/mt67-u7-hands-side.webp";
import d_mt67_u7_pay from "./dars/rasm/mt67-u7-pay.webp";
import d_mt67_u8_cause from "./dars/rasm/mt67-u8-cause.webp";
import d_mt67_u8_count_by_two from "./dars/rasm/mt67-u8-count-by-two.webp";
import d_mt67_u8_count_master from "./dars/rasm/mt67-u8-count-master.webp";
import d_mt67_u8_effect from "./dars/rasm/mt67-u8-effect.webp";
import d_mt67_u8_growing from "./dars/rasm/mt67-u8-growing.webp";
import d_mt67_u8_last from "./dars/rasm/mt67-u8-last.webp";
import d_mt67_u8_math_master from "./dars/rasm/mt67-u8-math-master.webp";
import d_mt67_u8_rule from "./dars/rasm/mt67-u8-rule.webp";
import d_mt67_u8_school_bag from "./dars/rasm/mt67-u8-school-bag.webp";
import d_mt67_u8_second_third from "./dars/rasm/mt67-u8-second-third.webp";
import d_mt67_u8_sequence from "./dars/rasm/mt67-u8-sequence.webp";
import d_m_boshqotirma from "./dars/rasm/m-boshqotirma.webp";
import d_m_dost from "./dars/rasm/m-dost.webp";
import d_m_mazali from "./dars/rasm/m-mazali.webp";
import d_m_non from "./dars/rasm/m-non.webp";
import d_m_oqituvchi from "./dars/rasm/m-oqituvchi.webp";
import d_m_osh from "./dars/rasm/m-osh.webp";
import d_m_qollar from "./dars/rasm/m-qollar.webp";
import d_m_salom from "./dars/rasm/m-salom.webp";
import d_m_hammom from "./dars/rasm/m-hammom.webp";
import d_m_mehmonxona from "./dars/rasm/m-mehmonxona.webp";
import d_m_ostida from "./dars/rasm/m-ostida.webp";
import d_m_ostida_tagida from "./dars/rasm/m-ostida-tagida.webp";
import d_m_otish from "./dars/rasm/m-otish.webp";
import d_m_payshanba from "./dars/rasm/m-payshanba.webp";
import d_m_penal from "./dars/rasm/m-penal.webp";
import d_m_pijama from "./dars/rasm/m-pijama.webp";
import d_m_piyola from "./dars/rasm/m-piyola.webp";
import d_m_qayerda from "./dars/rasm/m-qayerda.webp";
import d_m_qila_olaman_bilaman from "./dars/rasm/m-qila-olaman-bilaman.webp";
import d_m_qila_olasanmi_bilasanmi from "./dars/rasm/m-qila-olasanmi-bilasanmi.webp";
import d_m_qila_olmaydi from "./dars/rasm/m-qila-olmaydi.webp";
import d_m_qila_olmoq from "./dars/rasm/m-qila-olmoq.webp";
import d_m_qongiz from "./dars/rasm/m-qongiz.webp";
import d_m_qorqinchli from "./dars/rasm/m-qorqinchli.webp";
import d_m_qorqqan from "./dars/rasm/m-qorqqan.webp";
import d_m_qorqyapman from "./dars/rasm/m-qorqyapman.webp";
import d_m_qoshiq from "./dars/rasm/m-qoshiq.webp";
import d_m_qoshuv from "./dars/rasm/m-qoshuv.webp";
import d_m_qoshuv_plyus from "./dars/rasm/m-qoshuv-plyus.webp";
import d_m_qogoz from "./dars/rasm/m-qogoz.webp";
import d_m_qor_yogyapti from "./dars/rasm/m-qor-yogyapti.webp";
import d_m_qorni_och from "./dars/rasm/m-qorni-och.webp";
import d_m_quchoq from "./dars/rasm/m-quchoq.webp";
import d_m_quchoqla from "./dars/rasm/m-quchoqla.webp";
import d_m_quchoqlash from "./dars/rasm/m-quchoqlash.webp";
import d_m_quti from "./dars/rasm/m-quti.webp";
import d_m_radio from "./dars/rasm/m-radio.webp";
import d_m_sana from "./dars/rasm/m-sana.webp";
import d_m_sanamoq from "./dars/rasm/m-sanamoq.webp";
import d_m_sen_qila_olasanmi from "./dars/rasm/m-sen-qila-olasanmi.webp";
import d_m_sen_olasan from "./dars/rasm/m-sen-olasan.webp";
import d_m_sen_olasanmi from "./dars/rasm/m-sen-olasanmi.webp";
import d_m_sening from "./dars/rasm/m-sening.webp";
import d_m_seshanba from "./dars/rasm/m-seshanba.webp";
import d_m_shamol_esyapti from "./dars/rasm/m-shamol-esyapti.webp";
import d_en67_u16_it_was_fun from "./dars/rasm/en67-u16-it-was-fun.webp";
import d_en67_u16_we_went_to_the_zoo from "./dars/rasm/en67-u16-we-went-to-the-zoo.webp";
import d_en67_u16_what_did_you_do_yesterday from "./dars/rasm/en67-u16-what-did-you-do-yesterday.webp";
import d_en67_u17_chest from "./dars/rasm/en67-u17-chest.webp";
import d_en67_u17_diploma from "./dars/rasm/en67-u17-diploma.webp";
import d_en67_u17_forest from "./dars/rasm/en67-u17-forest.webp";
import d_en67_u17_graduation from "./dars/rasm/en67-u17-graduation.webp";
import d_en67_u17_help_me from "./dars/rasm/en67-u17-help-me.webp";
import d_en67_u17_hooray from "./dars/rasm/en67-u17-hooray.webp";
import d_en67_u17_im_ready_for_school from "./dars/rasm/en67-u17-im-ready-for-school.webp";
import d_en67_u17_mouse from "./dars/rasm/en67-u17-mouse.webp";
import d_en67_u17_net from "./dars/rasm/en67-u17-net.webp";
import d_en67_u17_pull_pull_pull from "./dars/rasm/en67-u17-pull-pull-pull.webp";
import d_en67_u17_she_is_kind from "./dars/rasm/en67-u17-she-is-kind.webp";
import d_en67_u17_she_is_lazy from "./dars/rasm/en67-u17-she-is-lazy.webp";
import d_en67_u17_thank_you_little_mouse from "./dars/rasm/en67-u17-thank-you-little-mouse.webp";
import d_en67_u17_turnip from "./dars/rasm/en67-u17-turnip.webp";
import d_en67_u17_we_did_it from "./dars/rasm/en67-u17-we-did-it.webp";
import d_en67_u2_evening from "./dars/rasm/en67-u2-evening.webp";
import d_en67_u2_friday from "./dars/rasm/en67-u2-friday.webp";
import d_en67_u2_monday from "./dars/rasm/en67-u2-monday.webp";
import d_en67_u2_morning from "./dars/rasm/en67-u2-morning.webp";
import d_en67_u2_night from "./dars/rasm/en67-u2-night.webp";
import d_en67_u2_saturday from "./dars/rasm/en67-u2-saturday.webp";
import d_en67_u2_sunday from "./dars/rasm/en67-u2-sunday.webp";
import d_en67_u2_thursday from "./dars/rasm/en67-u2-thursday.webp";
import d_en67_u2_today_is from "./dars/rasm/en67-u2-today-is.webp";
import d_en67_u2_tomorrow from "./dars/rasm/en67-u2-tomorrow.webp";
import d_en67_u2_tuesday from "./dars/rasm/en67-u2-tuesday.webp";
import d_en67_u2_wednesday from "./dars/rasm/en67-u2-wednesday.webp";
import d_en67_u2_week from "./dars/rasm/en67-u2-week.webp";
import d_en67_u2_weekend from "./dars/rasm/en67-u2-weekend.webp";
import d_en67_u2_what_day from "./dars/rasm/en67-u2-what-day.webp";
import d_en67_u3_builder from "./dars/rasm/en67-u3-builder.webp";
import d_en67_u3_cook from "./dars/rasm/en67-u3-cook.webp";
import d_en67_u3_doctor from "./dars/rasm/en67-u3-doctor.webp";
import d_en67_u3_farm from "./dars/rasm/en67-u3-farm.webp";
import d_en67_u3_farmer from "./dars/rasm/en67-u3-farmer.webp";
import d_en67_u3_firefighter from "./dars/rasm/en67-u3-firefighter.webp";
import d_en67_u3_he_is_doctor from "./dars/rasm/en67-u3-he-is-doctor.webp";
import d_en67_u3_hospital from "./dars/rasm/en67-u3-hospital.webp";
import d_en67_u3_pilot from "./dars/rasm/en67-u3-pilot.webp";
import d_en67_u3_police_officer from "./dars/rasm/en67-u3-police-officer.webp";
import d_en67_u3_school from "./dars/rasm/en67-u3-school.webp";
import d_en67_u3_she_is_teacher from "./dars/rasm/en67-u3-she-is-teacher.webp";
import d_en67_u3_shop from "./dars/rasm/en67-u3-shop.webp";
import d_en67_u3_teacher from "./dars/rasm/en67-u3-teacher.webp";
import d_en67_u3_want_pilot from "./dars/rasm/en67-u3-want-pilot.webp";
import d_en67_u3_want_to_be from "./dars/rasm/en67-u3-want-to-be.webp";
import d_en67_u4_ambulance from "./dars/rasm/en67-u4-ambulance.webp";
import d_en67_u4_bike from "./dars/rasm/en67-u4-bike.webp";
import d_en67_u4_boat from "./dars/rasm/en67-u4-boat.webp";
import d_en67_u4_bus from "./dars/rasm/en67-u4-bus.webp";
import d_en67_u4_car from "./dars/rasm/en67-u4-car.webp";
import d_en67_u4_fire_engine from "./dars/rasm/en67-u4-fire-engine.webp";
import d_en67_u4_go_by_bus from "./dars/rasm/en67-u4-go-by-bus.webp";
import d_en67_u4_helicopter from "./dars/rasm/en67-u4-helicopter.webp";
import d_en67_u4_how_go_school from "./dars/rasm/en67-u4-how-go-school.webp";
import d_en67_u4_i_walk from "./dars/rasm/en67-u4-i-walk.webp";
import d_en67_u4_plane from "./dars/rasm/en67-u4-plane.webp";
import d_en67_u4_police_car from "./dars/rasm/en67-u4-police-car.webp";
import d_en67_u4_ship from "./dars/rasm/en67-u4-ship.webp";
import d_en67_u4_stop from "./dars/rasm/en67-u4-stop.webp";
import d_en67_u4_taxi from "./dars/rasm/en67-u4-taxi.webp";
import d_en67_u4_train from "./dars/rasm/en67-u4-train.webp";
import d_en67_u5_be_quiet from "./dars/rasm/en67-u5-be-quiet.webp";
import d_en67_u5_book from "./dars/rasm/en67-u5-book.webp";
import d_en67_u5_close_book from "./dars/rasm/en67-u5-close-book.webp";
import d_en67_u5_crayons from "./dars/rasm/en67-u5-crayons.webp";
import d_en67_u5_listen from "./dars/rasm/en67-u5-listen.webp";
import d_en67_u5_look from "./dars/rasm/en67-u5-look.webp";
import d_en67_u5_notebook from "./dars/rasm/en67-u5-notebook.webp";
import d_en67_u5_open_book from "./dars/rasm/en67-u5-open-book.webp";
import d_en67_u5_pen from "./dars/rasm/en67-u5-pen.webp";
import d_en67_u5_pencil from "./dars/rasm/en67-u5-pencil.webp";
import d_en67_u5_raise_hand from "./dars/rasm/en67-u5-raise-hand.webp";
import d_en67_u5_ruler from "./dars/rasm/en67-u5-ruler.webp";
import d_en67_u5_school_bag from "./dars/rasm/en67-u5-school-bag.webp";
import d_en67_u5_scissors from "./dars/rasm/en67-u5-scissors.webp";
import d_en67_u5_sit_down from "./dars/rasm/en67-u5-sit-down.webp";
import d_en67_u5_stand_up from "./dars/rasm/en67-u5-stand-up.webp";
import d_en67_u6_bird_fly from "./dars/rasm/en67-u6-bird-fly.webp";
import d_en67_u6_can_you_swim from "./dars/rasm/en67-u6-can-you-swim.webp";
import d_en67_u6_climb from "./dars/rasm/en67-u6-climb.webp";
import d_en67_u6_fish_swim from "./dars/rasm/en67-u6-fish-swim.webp";
import d_en67_u6_frog_jump from "./dars/rasm/en67-u6-frog-jump.webp";
import d_en67_u6_help_me from "./dars/rasm/en67-u6-help-me.webp";
import d_en67_u6_lets_play from "./dars/rasm/en67-u6-lets-play.webp";
import d_en67_u6_no_i_cant from "./dars/rasm/en67-u6-no-i-cant.webp";
import d_en67_u6_of_course from "./dars/rasm/en67-u6-of-course.webp";
import d_en67_u6_play_football from "./dars/rasm/en67-u6-play-football.webp";
import d_en67_u6_ride_bike from "./dars/rasm/en67-u6-ride-bike.webp";
import d_en67_u6_skate from "./dars/rasm/en67-u6-skate.webp";
import d_en67_u6_snake_cant_walk from "./dars/rasm/en67-u6-snake-cant-walk.webp";
import d_en67_u6_well_done from "./dars/rasm/en67-u6-well-done.webp";
import d_en67_u6_yes_i_can from "./dars/rasm/en67-u6-yes-i-can.webp";
import d_en67_u7_apple_please from "./dars/rasm/en67-u7-apple-please.webp";
import d_en67_u7_basket from "./dars/rasm/en67-u7-basket.webp";
import d_en67_u7_can_i_help from "./dars/rasm/en67-u7-can-i-help.webp";
import d_en67_u7_carrots from "./dars/rasm/en67-u7-carrots.webp";
import d_en56_u8_have_ball from "./dars/rasm/en56-u8-have-ball.webp";
import d_en56_u8_have_cat from "./dars/rasm/en56-u8-have-cat.webp";
import d_en56_u8_have_dog from "./dars/rasm/en56-u8-have-dog.webp";
import d_en56_u8_have_doll from "./dars/rasm/en56-u8-have-doll.webp";
import d_en56_u8_i_am_big from "./dars/rasm/en56-u8-i-am-big.webp";
import d_en56_u8_i_am_five from "./dars/rasm/en56-u8-i-am-five.webp";
import d_en56_u8_see_you_soon from "./dars/rasm/en56-u8-see-you-soon.webp";
import d_en67_s1_counting_eggs from "./dars/rasm/en67-s1-counting-eggs.webp";
import d_en67_s18_time_for_school from "./dars/rasm/en67-s18-time-for-school.webp";
import d_en67_s19_at_the_clinic from "./dars/rasm/en67-s19-at-the-clinic.webp";
import d_en67_s2_planning_week from "./dars/rasm/en67-s2-planning-week.webp";
import d_en67_s20_way_to_the_zoo from "./dars/rasm/en67-s20-way-to-the-zoo.webp";
import d_en67_s21_grandmas_visit from "./dars/rasm/en67-s21-grandmas-visit.webp";
import d_en67_s22_phone_call_now from "./dars/rasm/en67-s22-phone-call-now.webp";
import d_en67_s23_monday_morning from "./dars/rasm/en67-s23-monday-morning.webp";
import d_en67_s24_new_teacher from "./dars/rasm/en67-s24-new-teacher.webp";
import d_en67_s3_at_the_doctor from "./dars/rasm/en67-s3-at-the-doctor.webp";
import d_en67_s4_bus_ride from "./dars/rasm/en67-s4-bus-ride.webp";
import d_en67_s5_first_day_school from "./dars/rasm/en67-s5-first-day-school.webp";
import d_en67_s6_sports_day from "./dars/rasm/en67-s6-sports-day.webp";
import d_en67_s7_shopping_list from "./dars/rasm/en67-s7-shopping-list.webp";
import d_en67_s8_phone_call from "./dars/rasm/en67-s8-phone-call.webp";
import d_en67_u1_eighteen from "./dars/rasm/en67-u1-eighteen.webp";
import d_en67_u1_eleven from "./dars/rasm/en67-u1-eleven.webp";
import d_en67_u1_fifteen_cats from "./dars/rasm/en67-u1-fifteen-cats.webp";
import d_en67_u1_fifteen from "./dars/rasm/en67-u1-fifteen.webp";
import d_en67_u1_fourteen from "./dars/rasm/en67-u1-fourteen.webp";
import d_en67_u1_how_many from "./dars/rasm/en67-u1-how-many.webp";
import d_en67_u1_lets_count from "./dars/rasm/en67-u1-lets-count.webp";
import d_en67_u1_nineteen from "./dars/rasm/en67-u1-nineteen.webp";
import d_en67_u1_seventeen from "./dars/rasm/en67-u1-seventeen.webp";
import d_en67_u1_sixteen from "./dars/rasm/en67-u1-sixteen.webp";
import d_en67_u1_thirteen from "./dars/rasm/en67-u1-thirteen.webp";
import d_en67_u1_twelve from "./dars/rasm/en67-u1-twelve.webp";
import d_en67_u1_twenty_stars from "./dars/rasm/en67-u1-twenty-stars.webp";
import d_en67_u1_twenty from "./dars/rasm/en67-u1-twenty.webp";
import d_en67_u11_i_do_my_homework from "./dars/rasm/en67-u11-i-do-my-homework.webp";
import d_en67_u11_i_get_dressed from "./dars/rasm/en67-u11-i-get-dressed.webp";
import d_en67_u11_i_get_up from "./dars/rasm/en67-u11-i-get-up.webp";
import d_en67_u11_i_go_to_school from "./dars/rasm/en67-u11-i-go-to-school.webp";
import d_en67_u11_i_have_breakfast from "./dars/rasm/en67-u11-i-have-breakfast.webp";
import d_en67_u11_i_have_lunch from "./dars/rasm/en67-u11-i-have-lunch.webp";
import d_en67_u11_i_play_with_friends from "./dars/rasm/en67-u11-i-play-with-friends.webp";
import d_en67_u11_i_wash_my_face from "./dars/rasm/en67-u11-i-wash-my-face.webp";
import d_en67_u11_i_watch_tv from "./dars/rasm/en67-u11-i-watch-tv.webp";
import d_en67_u11_im_reading from "./dars/rasm/en67-u11-im-reading.webp";
import d_en67_u11_its_half_past_seven from "./dars/rasm/en67-u11-its-half-past-seven.webp";
import d_en67_u11_its_seven_oclock from "./dars/rasm/en67-u11-its-seven-oclock.webp";
import d_en67_u11_shes_singing from "./dars/rasm/en67-u11-shes-singing.webp";
import d_en67_u11_the_fish_is_swimming from "./dars/rasm/en67-u11-the-fish-is-swimming.webp";
import d_en67_u11_traffic_light from "./dars/rasm/en67-u11-traffic-light.webp";
import d_en67_u11_watch from "./dars/rasm/en67-u11-watch.webp";
import d_en67_u11_what_time_is_it from "./dars/rasm/en67-u11-what-time-is-it.webp";
import d_en67_u12_drink_water from "./dars/rasm/en67-u12-drink-water.webp";
import d_en67_u12_eat_fruit from "./dars/rasm/en67-u12-eat-fruit.webp";
import d_en67_u12_get_well_soon from "./dars/rasm/en67-u12-get-well-soon.webp";
import d_en67_u12_i_have_a_headache from "./dars/rasm/en67-u12-i-have-a-headache.webp";
import d_en67_u12_i_have_a_stomachache from "./dars/rasm/en67-u12-i-have-a-stomachache.webp";
import d_en67_u12_im_sick from "./dars/rasm/en67-u12-im-sick.webp";
import d_en67_u12_medicine from "./dars/rasm/en67-u12-medicine.webp";
import d_en67_u12_nurse from "./dars/rasm/en67-u12-nurse.webp";
import d_en67_u12_sleep_well from "./dars/rasm/en67-u12-sleep-well.webp";
import d_en67_u12_thermometer from "./dars/rasm/en67-u12-thermometer.webp";
import d_en67_u12_whats_the_matter from "./dars/rasm/en67-u12-whats-the-matter.webp";
import d_en67_u13_bakery from "./dars/rasm/en67-u13-bakery.webp";
import d_en67_u13_behind from "./dars/rasm/en67-u13-behind.webp";
import d_en67_u13_bus_stop from "./dars/rasm/en67-u13-bus-stop.webp";
import d_en67_u13_crossing from "./dars/rasm/en67-u13-crossing.webp";
import d_en67_u13_go_straight from "./dars/rasm/en67-u13-go-straight.webp";
import d_en67_u13_in_front_of from "./dars/rasm/en67-u13-in-front-of.webp";
import d_en67_u13_library from "./dars/rasm/en67-u13-library.webp";
import d_en67_u13_look_left_and_right from "./dars/rasm/en67-u13-look-left-and-right.webp";
import d_en67_u13_next_to from "./dars/rasm/en67-u13-next-to.webp";
import d_en67_u13_park from "./dars/rasm/en67-u13-park.webp";
import d_en67_u13_turn_left from "./dars/rasm/en67-u13-turn-left.webp";
import d_en67_u13_turn_right from "./dars/rasm/en67-u13-turn-right.webp";
import d_en67_u13_wait from "./dars/rasm/en67-u13-wait.webp";
import d_en67_u13_where_is_the_park from "./dars/rasm/en67-u13-where-is-the-park.webp";
import d_en67_u13_zoo from "./dars/rasm/en67-u13-zoo.webp";
import d_en67_u14_bowl from "./dars/rasm/en67-u14-bowl.webp";
import d_en67_u14_cup from "./dars/rasm/en67-u14-cup.webp";
import d_en67_u14_cut from "./dars/rasm/en67-u14-cut.webp";
import d_en67_u14_fork from "./dars/rasm/en67-u14-fork.webp";
import d_en67_u14_its_delicious from "./dars/rasm/en67-u14-its-delicious.webp";
import d_en67_u14_lets_make_a_salad from "./dars/rasm/en67-u14-lets-make-a-salad.webp";
import d_en67_u14_mix from "./dars/rasm/en67-u14-mix.webp";
import d_en67_u14_plate from "./dars/rasm/en67-u14-plate.webp";
import d_en67_u14_spoon from "./dars/rasm/en67-u14-spoon.webp";
import d_en67_u14_would_you_like_some_tea from "./dars/rasm/en67-u14-would-you-like-some-tea.webp";
import d_en67_u15_im_playing from "./dars/rasm/en67-u15-im-playing.webp";
import d_en67_u15_the_birds_are_singing from "./dars/rasm/en67-u15-the-birds-are-singing.webp";
import d_en67_u15_the_cat_is_sleeping from "./dars/rasm/en67-u15-the-cat-is-sleeping.webp";
import d_en67_u15_the_dog_is_running from "./dars/rasm/en67-u15-the-dog-is-running.webp";
import d_en67_u15_theyre_running from "./dars/rasm/en67-u15-theyre-running.webp";
import d_en67_u15_what_are_you_doing from "./dars/rasm/en67-u15-what-are-you-doing.webp";
import d_en67_u16_i_ate_ice_cream from "./dars/rasm/en67-u16-i-ate-ice-cream.webp";
import d_en67_u16_i_saw_a_big_dog from "./dars/rasm/en67-u16-i-saw-a-big-dog.webp";
import d_en67_u16_i_saw_a_rainbow from "./dars/rasm/en67-u16-i-saw-a-rainbow.webp";
import d_en67_u16_i_visited_my_granny from "./dars/rasm/en67-u16-i-visited-my-granny.webp";
import d_en67_u16_i_went_to_the_park from "./dars/rasm/en67-u16-i-went-to-the-park.webp";
import d_en67_u7_eggs from "./dars/rasm/en67-u7-eggs.webp";
import d_en67_u7_five_bananas from "./dars/rasm/en67-u7-five-bananas.webp";
import d_en67_u7_goodbye_see_you from "./dars/rasm/en67-u7-goodbye-see-you.webp";
import d_en67_u7_how_many_bananas from "./dars/rasm/en67-u7-how-many-bananas.webp";
import d_en67_u7_money from "./dars/rasm/en67-u7-money.webp";
import d_en67_u7_potatoes from "./dars/rasm/en67-u7-potatoes.webp";
import d_en67_u7_thank_you from "./dars/rasm/en67-u7-thank-you.webp";
import d_en67_u7_tomatoes from "./dars/rasm/en67-u7-tomatoes.webp";
import d_en67_u8_favourite_green from "./dars/rasm/en67-u8-favourite-green.webp";
import d_en67_u8_favourite_plov from "./dars/rasm/en67-u8-favourite-plov.webp";
import d_en67_u8_from_uzbekistan from "./dars/rasm/en67-u8-from-uzbekistan.webp";
import d_en67_u8_have_pet from "./dars/rasm/en67-u8-have-pet.webp";
import d_en67_u8_have_sister from "./dars/rasm/en67-u8-have-sister.webp";
import d_en67_u8_how_old from "./dars/rasm/en67-u8-how-old.webp";
import d_en67_u8_i_am_seven from "./dars/rasm/en67-u8-i-am-seven.webp";
import d_en67_u8_i_am_six from "./dars/rasm/en67-u8-i-am-six.webp";
import d_en67_u8_like_football from "./dars/rasm/en67-u8-like-football.webp";
import d_en67_u8_live_samarkand from "./dars/rasm/en67-u8-live-samarkand.webp";
import d_en67_u8_my_name_is from "./dars/rasm/en67-u8-my-name-is.webp";
import d_en67_u8_nice_to_meet from "./dars/rasm/en67-u8-nice-to-meet.webp";
import d_en67_u8_this_is_me from "./dars/rasm/en67-u8-this-is-me.webp";
import d_en67_u8_what_like from "./dars/rasm/en67-u8-what-like.webp";
import d_en67_u8_where_live from "./dars/rasm/en67-u8-where-live.webp";
import d_mt56_u1_count_rule from "./dars/rasm/mt56-u1-count-rule.webp";
import d_mt56_u1_number_line from "./dars/rasm/mt56-u1-number-line.webp";
import d_mt56_u1_zero from "./dars/rasm/mt56-u1-zero.webp";
import d_mt56_u2_count_ten from "./dars/rasm/mt56-u2-count-ten.webp";
import d_mt56_u2_equal from "./dars/rasm/mt56-u2-equal.webp";
import d_mt56_u2_few from "./dars/rasm/mt56-u2-few.webp";
import d_mt56_u3_before from "./dars/rasm/mt56-u3-before.webp";
import d_mt56_u3_count_back from "./dars/rasm/mt56-u3-count-back.webp";
import d_mt56_u3_gap from "./dars/rasm/mt56-u3-gap.webp";
import d_mt56_u3_middle from "./dars/rasm/mt56-u3-middle.webp";
import d_mt56_u3_neighbors from "./dars/rasm/mt56-u3-neighbors.webp";
import d_mt56_u3_next from "./dars/rasm/mt56-u3-next.webp";
import d_mt56_u3_one_less from "./dars/rasm/mt56-u3-one-less.webp";
import d_mt56_u3_rocket from "./dars/rasm/mt56-u3-rocket.webp";
import d_mt56_u3_ten_to_zero from "./dars/rasm/mt56-u3-ten-to-zero.webp";
import d_mt56_u4_eight_parts from "./dars/rasm/mt56-u4-eight-parts.webp";
import d_mt56_u4_five_five from "./dars/rasm/mt56-u4-five-five.webp";
import d_mt56_u4_five_parts from "./dars/rasm/mt56-u4-five-parts.webp";
import d_mt56_u4_four_parts from "./dars/rasm/mt56-u4-four-parts.webp";
import d_mt56_u4_nine_parts from "./dars/rasm/mt56-u4-nine-parts.webp";
import d_mt56_u4_seven_parts from "./dars/rasm/mt56-u4-seven-parts.webp";
import d_mt56_u4_six_parts from "./dars/rasm/mt56-u4-six-parts.webp";
import d_mt56_u4_ten_friends from "./dars/rasm/mt56-u4-ten-friends.webp";
import d_mt56_u4_three_parts from "./dars/rasm/mt56-u4-three-parts.webp";
import d_mt56_u5_build_shapes from "./dars/rasm/mt56-u5-build-shapes.webp";
import d_mt56_u5_cone from "./dars/rasm/mt56-u5-cone.webp";
import d_mt56_u5_cube from "./dars/rasm/mt56-u5-cube.webp";
import d_mt56_u5_cylinder from "./dars/rasm/mt56-u5-cylinder.webp";
import d_mt56_u5_home_shapes from "./dars/rasm/mt56-u5-home-shapes.webp";
import d_mt56_u5_rolling from "./dars/rasm/mt56-u5-rolling.webp";
import d_mt56_u5_standing from "./dars/rasm/mt56-u5-standing.webp";
import d_mt56_u6_season_circle from "./dars/rasm/mt56-u6-season-circle.webp";
import d_mt56_u6_seven_days from "./dars/rasm/mt56-u6-seven-days.webp";
import d_mt56_u6_thu_fri from "./dars/rasm/mt56-u6-thu-fri.webp";
import d_mt56_u6_tue_wed from "./dars/rasm/mt56-u6-tue-wed.webp";
import d_mt56_u6_weekend from "./dars/rasm/mt56-u6-weekend.webp";
import d_mt56_u6_yesterday_tomorrow from "./dars/rasm/mt56-u6-yesterday-tomorrow.webp";
import d_mt56_u7_align from "./dars/rasm/mt56-u7-align.webp";
import d_mt56_u7_far from "./dars/rasm/mt56-u7-far.webp";
import d_mt56_u7_heavy from "./dars/rasm/mt56-u7-heavy.webp";
import d_mt56_u7_light from "./dars/rasm/mt56-u7-light.webp";
import d_mt56_u7_lines from "./dars/rasm/mt56-u7-lines.webp";
import d_mt56_u7_short from "./dars/rasm/mt56-u7-short.webp";
import d_mt56_u7_span from "./dars/rasm/mt56-u7-span.webp";
import d_mt56_u7_step_size from "./dars/rasm/mt56-u7-step-size.webp";
import d_mt56_u7_step from "./dars/rasm/mt56-u7-step.webp";
import d_mt56_u7_string from "./dars/rasm/mt56-u7-string.webp";
import d_mt56_u8_arrow from "./dars/rasm/mt56-u8-arrow.webp";
import d_mt56_u8_group from "./dars/rasm/mt56-u8-group.webp";
import d_mt56_u8_maze from "./dars/rasm/mt56-u8-maze.webp";
import d_mt56_u8_number_pattern from "./dars/rasm/mt56-u8-number-pattern.webp";
import d_mt56_u8_odd_one from "./dars/rasm/mt56-u8-odd-one.webp";
import d_mt56_u8_path from "./dars/rasm/mt56-u8-path.webp";
import d_mt56_u8_pattern from "./dars/rasm/mt56-u8-pattern.webp";
import d_mt56_u8_up_down from "./dars/rasm/mt56-u8-up-down.webp";
import d_mt56_u8_whats_next from "./dars/rasm/mt56-u8-whats-next.webp";
import d_mt67_u1_count_twenty from "./dars/rasm/mt67-u1-count-twenty.webp";
import d_mt67_u1_eighteen from "./dars/rasm/mt67-u1-eighteen.webp";
import d_mt67_u1_eleven from "./dars/rasm/mt67-u1-eleven.webp";
import d_mt67_u1_fifteen from "./dars/rasm/mt67-u1-fifteen.webp";
import d_mt67_u1_fourteen from "./dars/rasm/mt67-u1-fourteen.webp";
import d_mt67_u1_nineteen from "./dars/rasm/mt67-u1-nineteen.webp";
import d_mt67_u1_seventeen from "./dars/rasm/mt67-u1-seventeen.webp";
import d_mt67_u1_sixteen from "./dars/rasm/mt67-u1-sixteen.webp";
import d_mt67_u1_ten_bundle from "./dars/rasm/mt67-u1-ten-bundle.webp";
import d_mt67_u1_thirteen from "./dars/rasm/mt67-u1-thirteen.webp";
import d_mt67_u1_twelve from "./dars/rasm/mt67-u1-twelve.webp";
import d_mt67_u2_adding from "./dars/rasm/mt67-u2-adding.webp";
import d_mt67_u2_count_on from "./dars/rasm/mt67-u2-count-on.webp";
import d_mt67_u2_equals from "./dars/rasm/mt67-u2-equals.webp";
import d_mt67_u2_fingers from "./dars/rasm/mt67-u2-fingers.webp";
import d_mt67_u2_make_ten from "./dars/rasm/mt67-u2-make-ten.webp";
import d_mt67_u2_picture_sum from "./dars/rasm/mt67-u2-picture-sum.webp";
import d_mt67_u2_plus_one from "./dars/rasm/mt67-u2-plus-one.webp";
import d_mt67_u2_plus_zero from "./dars/rasm/mt67-u2-plus-zero.webp";
import d_mt67_u2_plus from "./dars/rasm/mt67-u2-plus.webp";
import d_mt67_u2_swap from "./dars/rasm/mt67-u2-swap.webp";
// REV260: bog'cha rasmlari 001–600 (rassom)
import d_mt34_u6_kechki_ovqat from "./dars/rasm/mt34-u6-kechki-ovqat.webp";
import d_mt34_u6_tunda from "./dars/rasm/mt34-u6-tunda.webp";
import d_mt34_u6_uxlash from "./dars/rasm/mt34-u6-uxlash.webp";
import d_mt34_u7_chap_qol from "./dars/rasm/mt34-u7-chap-qol.webp";
import d_mt34_u7_ong_qol from "./dars/rasm/mt34-u7-ong-qol.webp";
import d_mt34_u8_doira_kvadrat from "./dars/rasm/mt34-u8-doira-kvadrat.webp";
import d_mt34_u8_keyingisi from "./dars/rasm/mt34-u8-keyingisi.webp";
import d_mt34_u8_naqsh_xato from "./dars/rasm/mt34-u8-naqsh-xato.webp";
import d_mt34_u8_naqsh from "./dars/rasm/mt34-u8-naqsh.webp";
import d_mt34_u8_qizil_sariq from "./dars/rasm/mt34-u8-qizil-sariq.webp";
import d_mt34_u8_yashil_kok from "./dars/rasm/mt34-u8-yashil-kok.webp";
import d_mt45_u1_birdan_beshgacha from "./dars/rasm/mt45-u1-birdan-beshgacha.webp";
import d_mt45_u1_bitta_tegamiz from "./dars/rasm/mt45-u1-bitta-tegamiz.webp";
import d_mt45_u1_keyingi from "./dars/rasm/mt45-u1-keyingi.webp";
import d_mt45_u1_oldingi from "./dars/rasm/mt45-u1-oldingi.webp";
import d_mt45_u1_oxirgi_son from "./dars/rasm/mt45-u1-oxirgi-son.webp";
import d_mt45_u1_raqam from "./dars/rasm/mt45-u1-raqam.webp";
import d_mt45_u1_songa_mos from "./dars/rasm/mt45-u1-songa-mos.webp";
import d_mt45_u2_birdan_ongacha from "./dars/rasm/mt45-u2-birdan-ongacha.webp";
import d_mt45_u2_chumoli from "./dars/rasm/mt45-u2-chumoli.webp";
import d_mt45_u2_oltita from "./dars/rasm/mt45-u2-oltita.webp";
import d_mt45_u2_on_barmoq from "./dars/rasm/mt45-u2-on-barmoq.webp";
import d_mt45_u2_teskari from "./dars/rasm/mt45-u2-teskari.webp";
import d_mt45_u3_juftlab from "./dars/rasm/mt45-u3-juftlab.webp";
import d_mt45_u3_kamroq from "./dars/rasm/mt45-u3-kamroq.webp";
import d_mt45_u3_katta_son from "./dars/rasm/mt45-u3-katta-son.webp";
import d_mt45_u3_kichik_son from "./dars/rasm/mt45-u3-kichik-son.webp";
import d_mt45_u3_koproq from "./dars/rasm/mt45-u3-koproq.webp";
import d_mt45_u3_olib_tenglash from "./dars/rasm/mt45-u3-olib-tenglash.webp";
import d_mt45_u3_qoshib_tenglash from "./dars/rasm/mt45-u3-qoshib-tenglash.webp";
import d_mt45_u3_teng from "./dars/rasm/mt45-u3-teng.webp";
import d_mt45_u4_beshinchi from "./dars/rasm/mt45-u4-beshinchi.webp";
import d_mt45_u4_chap_qol from "./dars/rasm/mt45-u4-chap-qol.webp";
import d_mt45_u4_chapdan_ongga from "./dars/rasm/mt45-u4-chapdan-ongga.webp";
import d_mt45_u4_nechanchi from "./dars/rasm/mt45-u4-nechanchi.webp";
import d_mt45_u4_ong_qol from "./dars/rasm/mt45-u4-ong-qol.webp";
import d_mt45_u4_ongda_chapda from "./dars/rasm/mt45-u4-ongda-chapda.webp";
import d_mt45_u4_oxirgi from "./dars/rasm/mt45-u4-oxirgi.webp";
import d_mt45_u4_tortinchi from "./dars/rasm/mt45-u4-tortinchi.webp";
import d_mt45_u4_uchinchi from "./dars/rasm/mt45-u4-uchinchi.webp";
import d_mt45_u5_doira_oval from "./dars/rasm/mt45-u5-doira-oval.webp";
import d_mt45_u5_kvadrat_tortburchak from "./dars/rasm/mt45-u5-kvadrat-tortburchak.webp";
import d_mt45_u5_naqsh_bolagi from "./dars/rasm/mt45-u5-naqsh-bolagi.webp";
import d_mt45_u5_oval_narsalar from "./dars/rasm/mt45-u5-oval-narsalar.webp";
import d_mt45_u5_oval from "./dars/rasm/mt45-u5-oval.webp";
import d_mt45_u5_tortburchak_narsalar from "./dars/rasm/mt45-u5-tortburchak-narsalar.webp";
import d_mt45_u5_tortburchak from "./dars/rasm/mt45-u5-tortburchak.webp";
import d_mt45_u5_uch_naqsh from "./dars/rasm/mt45-u5-uch-naqsh.webp";
import d_mt45_u6_eng_katta from "./dars/rasm/mt45-u6-eng-katta.webp";
import d_mt45_u6_eng_kichik from "./dars/rasm/mt45-u6-eng-kichik.webp";
import d_mt45_u6_eng_qisqa from "./dars/rasm/mt45-u6-eng-qisqa.webp";
import d_mt45_u6_eng_uzun from "./dars/rasm/mt45-u6-eng-uzun.webp";
import d_mt45_u6_kattadan_kichikka from "./dars/rasm/mt45-u6-kattadan-kichikka.webp";
import d_mt45_u6_ortadagisi from "./dars/rasm/mt45-u6-ortadagisi.webp";
import d_mt45_u6_pastdan_balandga from "./dars/rasm/mt45-u6-pastdan-balandga.webp";
import d_mt45_u6_zinapoya from "./dars/rasm/mt45-u6-zinapoya.webp";
import d_mt45_u7_avval_keyin from "./dars/rasm/mt45-u7-avval-keyin.webp";
import d_mt45_u7_kun_tartibi from "./dars/rasm/mt45-u7-kun-tartibi.webp";
import d_mt45_u7_tunda from "./dars/rasm/mt45-u7-tunda.webp";
import d_mt45_u8_barmoqda_hisob from "./dars/rasm/mt45-u8-barmoqda-hisob.webp";
import d_mt45_u8_birga_nechta from "./dars/rasm/mt45-u8-birga-nechta.webp";
import d_mt45_u8_hammasi_ketdi from "./dars/rasm/mt45-u8-hammasi-ketdi.webp";
import d_mt45_u8_hikoya from "./dars/rasm/mt45-u8-hikoya.webp";
import d_mt45_u8_ketdi from "./dars/rasm/mt45-u8-ketdi.webp";
import d_mt45_u8_nechta_qoldi from "./dars/rasm/mt45-u8-nechta-qoldi.webp";
import d_mt45_u8_qoshildi from "./dars/rasm/mt45-u8-qoshildi.webp";
import d_am56_u1_havo from "./dars/rasm/am56-u1-havo.webp";
import d_am56_u1_jonsiz from "./dars/rasm/am56-u1-jonsiz.webp";
import d_am56_u1_odam from "./dars/rasm/am56-u1-odam.webp";
import d_am56_u1_osish from "./dars/rasm/am56-u1-osish.webp";
import d_am56_u1_tirik from "./dars/rasm/am56-u1-tirik.webp";
import d_am56_u2_erish from "./dars/rasm/am56-u2-erish.webp";
import d_am56_u2_idish from "./dars/rasm/am56-u2-idish.webp";
import d_am56_u2_issiqlik from "./dars/rasm/am56-u2-issiqlik.webp";
import d_am56_u2_muzlash from "./dars/rasm/am56-u2-muzlash.webp";
import d_am56_u2_muzlatgich from "./dars/rasm/am56-u2-muzlatgich.webp";
import d_am56_u2_qaynash from "./dars/rasm/am56-u2-qaynash.webp";
import d_am56_u2_qurish from "./dars/rasm/am56-u2-qurish.webp";
import d_am56_u2_suyuq from "./dars/rasm/am56-u2-suyuq.webp";
import d_am56_u2_tomchi from "./dars/rasm/am56-u2-tomchi.webp";
import d_am56_u3_deraza from "./dars/rasm/am56-u3-deraza.webp";
import d_am56_u3_havo2 from "./dars/rasm/am56-u3-havo2.webp";
import d_am56_u3_nafas from "./dars/rasm/am56-u3-nafas.webp";
import d_am56_u3_nasos from "./dars/rasm/am56-u3-nasos.webp";
import d_am56_u3_pufak from "./dars/rasm/am56-u3-pufak.webp";
import d_am56_u3_stakan from "./dars/rasm/am56-u3-stakan.webp";
import d_am56_u3_tutun from "./dars/rasm/am56-u3-tutun.webp";
import d_am56_u3_yelkan from "./dars/rasm/am56-u3-yelkan.webp";
import d_am56_u4_hilol from "./dars/rasm/am56-u4-hilol.webp";
import d_am56_u4_kunduz from "./dars/rasm/am56-u4-kunduz.webp";
import d_am56_u4_shapka from "./dars/rasm/am56-u4-shapka.webp";
import d_am56_u4_uyqu from "./dars/rasm/am56-u4-uyqu.webp";
import d_am56_u5_ayiq from "./dars/rasm/am56-u5-ayiq.webp";
import d_am56_u5_chumchuq from "./dars/rasm/am56-u5-chumchuq.webp";
import d_am56_u5_otxor from "./dars/rasm/am56-u5-otxor.webp";
import d_am56_u5_yirtqich from "./dars/rasm/am56-u5-yirtqich.webp";
import d_am56_u5_zanjir from "./dars/rasm/am56-u5-zanjir.webp";
import d_am56_u6_boyqush from "./dars/rasm/am56-u6-boyqush.webp";
import d_am56_u6_echki from "./dars/rasm/am56-u6-echki.webp";
import d_am56_u7_banka from "./dars/rasm/am56-u7-banka.webp";
import d_mt23_u1_kopdan_bitta from "./dars/rasm/mt23-u1-kopdan-bitta.webp";
import d_mt23_u1_tola from "./dars/rasm/mt23-u1-tola.webp";
import d_mt23_u2_daraxt_nihol from "./dars/rasm/mt23-u2-daraxt-nihol.webp";
import d_mt23_u2_katta_ayiq from "./dars/rasm/mt23-u2-katta-ayiq.webp";
import d_mt23_u2_katta_ordak from "./dars/rasm/mt23-u2-katta-ordak.webp";
import d_mt23_u2_kichik_ayiqcha from "./dars/rasm/mt23-u2-kichik-ayiqcha.webp";
import d_mt23_u2_kichik_ordakcha from "./dars/rasm/mt23-u2-kichik-ordakcha.webp";
import d_mt23_u2_tarvuz_olcha from "./dars/rasm/mt23-u2-tarvuz-olcha.webp";
import d_mt23_u3_bir_xil from "./dars/rasm/mt23-u3-bir-xil.webp";
import d_mt23_u3_juft from "./dars/rasm/mt23-u3-juft.webp";
import d_mt23_u3_mushuk_mushukcha from "./dars/rasm/mt23-u3-mushuk-mushukcha.webp";
import d_mt23_u3_poyabzal_jufti from "./dars/rasm/mt23-u3-poyabzal-jufti.webp";
import d_mt23_u3_qolqop_jufti from "./dars/rasm/mt23-u3-qolqop-jufti.webp";
import d_mt23_u3_tovuq_joja from "./dars/rasm/mt23-u3-tovuq-joja.webp";
import d_mt23_u4_bir_xil_rang from "./dars/rasm/mt23-u4-bir-xil-rang.webp";
import d_mt23_u4_terish from "./dars/rasm/mt23-u4-terish.webp";
import d_mt23_u5_doira_dumalaydi from "./dars/rasm/mt23-u5-doira-dumalaydi.webp";
import d_mt23_u5_doira from "./dars/rasm/mt23-u5-doira.webp";
import d_mt23_u5_dumaloq from "./dars/rasm/mt23-u5-dumaloq.webp";
import d_mt23_u5_kvadrat_dumalamaydi from "./dars/rasm/mt23-u5-kvadrat-dumalamaydi.webp";
import d_mt23_u5_kvadrat_narsalar from "./dars/rasm/mt23-u5-kvadrat-narsalar.webp";
import d_mt23_u6_qisqa_dum from "./dars/rasm/mt23-u6-qisqa-dum.webp";
import d_mt23_u6_qisqa_poyezd from "./dars/rasm/mt23-u6-qisqa-poyezd.webp";
import d_mt23_u6_qisqa from "./dars/rasm/mt23-u6-qisqa.webp";
import d_mt23_u6_uzun_boyin from "./dars/rasm/mt23-u6-uzun-boyin.webp";
import d_mt23_u6_uzun_poyezd from "./dars/rasm/mt23-u6-uzun-poyezd.webp";
import d_mt23_u7_daraxt_tagida from "./dars/rasm/mt23-u7-daraxt-tagida.webp";
import d_mt23_u7_daraxt_tepasida from "./dars/rasm/mt23-u7-daraxt-tepasida.webp";
import d_mt23_u7_pastga from "./dars/rasm/mt23-u7-pastga.webp";
import d_mt23_u7_tepada from "./dars/rasm/mt23-u7-tepada.webp";
import d_mt23_u7_tepaga from "./dars/rasm/mt23-u7-tepaga.webp";
import d_mt23_u8_savat_ichida from "./dars/rasm/mt23-u8-savat-ichida.webp";
import d_mt23_u8_savatdan_tashqarida from "./dars/rasm/mt23-u8-savatdan-tashqarida.webp";
import d_mt23_u8_tashqarida from "./dars/rasm/mt23-u8-tashqarida.webp";
import d_mt23_u8_uy_ichida from "./dars/rasm/mt23-u8-uy-ichida.webp";
import d_mt23_u8_uydan_tashqarida from "./dars/rasm/mt23-u8-uydan-tashqarida.webp";
import d_mt34_u1_barmoq_sanash from "./dars/rasm/mt34-u1-barmoq-sanash.webp";
import d_mt34_u1_bitta from "./dars/rasm/mt34-u1-bitta.webp";
import d_mt34_u1_ikkita from "./dars/rasm/mt34-u1-ikkita.webp";
import d_mt34_u1_ikkitadan from "./dars/rasm/mt34-u1-ikkitadan.webp";
import d_mt34_u1_oxirgi_son from "./dars/rasm/mt34-u1-oxirgi-son.webp";
import d_mt34_u1_uchta_ayiq from "./dars/rasm/mt34-u1-uchta-ayiq.webp";
import d_mt34_u1_uchta from "./dars/rasm/mt34-u1-uchta.webp";
import d_mt34_u2_barmoqda from "./dars/rasm/mt34-u2-barmoqda.webp";
import d_mt34_u2_beshta_barmoq from "./dars/rasm/mt34-u2-beshta-barmoq.webp";
import d_mt34_u2_beshta from "./dars/rasm/mt34-u2-beshta.webp";
import d_mt34_u2_keyingi_son from "./dars/rasm/mt34-u2-keyingi-son.webp";
import d_mt34_u2_sanoq_qatori from "./dars/rasm/mt34-u2-sanoq-qatori.webp";
import d_mt34_u2_songa_mos from "./dars/rasm/mt34-u2-songa-mos.webp";
import d_mt34_u2_tort_oyoq from "./dars/rasm/mt34-u2-tort-oyoq.webp";
import d_mt34_u2_tortta from "./dars/rasm/mt34-u2-tortta.webp";
import d_mt34_u3_bitta_qoshamiz from "./dars/rasm/mt34-u3-bitta-qoshamiz.webp";
import d_mt34_u3_bittasini_olamiz from "./dars/rasm/mt34-u3-bittasini-olamiz.webp";
import d_mt34_u3_juftlash from "./dars/rasm/mt34-u3-juftlash.webp";
import d_mt34_u3_ortib_qoldi from "./dars/rasm/mt34-u3-ortib-qoldi.webp";
import d_mt34_u3_teng_emas from "./dars/rasm/mt34-u3-teng-emas.webp";
import d_mt34_u3_teng from "./dars/rasm/mt34-u3-teng.webp";
import d_mt34_u4_burchak_yoq from "./dars/rasm/mt34-u4-burchak-yoq.webp";
import d_mt34_u4_doira from "./dars/rasm/mt34-u4-doira.webp";
import d_mt34_u4_shakldan_uy from "./dars/rasm/mt34-u4-shakldan-uy.webp";
import d_mt34_u4_shakliga_terish from "./dars/rasm/mt34-u4-shakliga-terish.webp";
import d_mt34_u4_tortta_burchak from "./dars/rasm/mt34-u4-tortta-burchak.webp";
import d_mt34_u4_uchburchak_narsalar from "./dars/rasm/mt34-u4-uchburchak-narsalar.webp";
import d_mt34_u4_uchta_burchak from "./dars/rasm/mt34-u4-uchta-burchak.webp";
import d_am34_u5_barg_tokilishi from "./dars/rasm/am34-u5-barg-tokilishi.webp";
import d_am34_u5_hosil from "./dars/rasm/am34-u5-hosil.webp";
import d_am34_u6_romashka from "./dars/rasm/am34-u6-romashka.webp";
import d_am34_u6_sugorish from "./dars/rasm/am34-u6-sugorish.webp";
import d_am34_u7_rels from "./dars/rasm/am34-u7-rels.webp";
import d_am34_u8_qozon from "./dars/rasm/am34-u8-qozon.webp";
import d_am34_u8_yolovchi from "./dars/rasm/am34-u8-yolovchi.webp";
import d_am45_u1_aylana from "./dars/rasm/am45-u1-aylana.webp";
import d_am45_u1_barglar_tokiladi from "./dars/rasm/am45-u1-barglar-tokiladi.webp";
import d_am45_u1_fasl_kiyimi from "./dars/rasm/am45-u1-fasl-kiyimi.webp";
import d_am45_u1_kun_qisqaradi from "./dars/rasm/am45-u1-kun-qisqaradi.webp";
import d_am45_u1_kurtaklar from "./dars/rasm/am45-u1-kurtaklar.webp";
import d_am45_u1_mevalar_pishadi from "./dars/rasm/am45-u1-mevalar-pishadi.webp";
import d_am45_u1_qor_yogadi from "./dars/rasm/am45-u1-qor-yogadi.webp";
import d_am45_u1_qushlar_ketadi from "./dars/rasm/am45-u1-qushlar-ketadi.webp";
import d_am45_u1_qushlar_qaytadi from "./dars/rasm/am45-u1-qushlar-qaytadi.webp";
import d_am45_u1_uzun_kun from "./dars/rasm/am45-u1-uzun-kun.webp";
import d_am45_u2_havo from "./dars/rasm/am45-u2-havo.webp";
import d_am45_u2_ildiz from "./dars/rasm/am45-u2-ildiz.webp";
import d_am45_u2_kundalik from "./dars/rasm/am45-u2-kundalik.webp";
import d_am45_u2_kuzatish from "./dars/rasm/am45-u2-kuzatish.webp";
import d_am45_u2_meva_urugi from "./dars/rasm/am45-u2-meva-urugi.webp";
import d_am45_u3_gul_shirasi from "./dars/rasm/am45-u3-gul-shirasi.webp";
import d_am45_u3_olti_oyoq from "./dars/rasm/am45-u3-olti-oyoq.webp";
import d_am45_u4_eshitish from "./dars/rasm/am45-u4-eshitish.webp";
import d_am45_u4_foydali_ovqat from "./dars/rasm/am45-u4-foydali-ovqat.webp";
import d_am45_u4_hid_bilish from "./dars/rasm/am45-u4-hid-bilish.webp";
import d_am45_u4_korish from "./dars/rasm/am45-u4-korish.webp";
import d_am45_u4_nafas from "./dars/rasm/am45-u4-nafas.webp";
import d_am45_u4_qol_yuvish from "./dars/rasm/am45-u4-qol-yuvish.webp";
import d_am45_u4_tam_bilish from "./dars/rasm/am45-u4-tam-bilish.webp";
import d_am45_u4_teri from "./dars/rasm/am45-u4-teri.webp";
import d_am45_u4_uyqu from "./dars/rasm/am45-u4-uyqu.webp";
import d_am45_u4_yurak from "./dars/rasm/am45-u4-yurak.webp";
import d_am45_u5_tarbiyachi from "./dars/rasm/am45-u5-tarbiyachi.webp";
import d_am45_u5_yelkanli_qayiq from "./dars/rasm/am45-u5-yelkanli-qayiq.webp";
import d_en45_u5_sister from "./dars/rasm/en45-u5-sister.webp";
import d_en45_u5_this_is_my from "./dars/rasm/en45-u5-this-is-my.webp";
import d_en45_u6_clap_your_hands from "./dars/rasm/en45-u6-clap-your-hands.webp";
import d_en45_u6_ears from "./dars/rasm/en45-u6-ears.webp";
import d_en45_u6_eyes from "./dars/rasm/en45-u6-eyes.webp";
import d_en45_u6_fingers from "./dars/rasm/en45-u6-fingers.webp";
import d_en45_u6_hands from "./dars/rasm/en45-u6-hands.webp";
import d_en45_u6_head from "./dars/rasm/en45-u6-head.webp";
import d_en45_u6_knees from "./dars/rasm/en45-u6-knees.webp";
import d_en45_u6_legs from "./dars/rasm/en45-u6-legs.webp";
import d_en45_u6_mouth from "./dars/rasm/en45-u6-mouth.webp";
import d_en45_u6_nose from "./dars/rasm/en45-u6-nose.webp";
import d_en45_u6_shoulders from "./dars/rasm/en45-u6-shoulders.webp";
import d_en45_u6_stamp_your_feet from "./dars/rasm/en45-u6-stamp-your-feet.webp";
import d_en45_u6_toes from "./dars/rasm/en45-u6-toes.webp";
import d_en45_u6_touch_your_nose from "./dars/rasm/en45-u6-touch-your-nose.webp";
import d_en45_u7_apple from "./dars/rasm/en45-u7-apple.webp";
import d_en45_u7_banana from "./dars/rasm/en45-u7-banana.webp";
import d_en45_u7_carrot from "./dars/rasm/en45-u7-carrot.webp";
import d_en45_u7_cucumber from "./dars/rasm/en45-u7-cucumber.webp";
import d_en45_u7_grapes from "./dars/rasm/en45-u7-grapes.webp";
import d_en45_u7_i_like from "./dars/rasm/en45-u7-i-like.webp";
import d_en45_u7_lemon from "./dars/rasm/en45-u7-lemon.webp";
import d_en45_u7_orange_fruit from "./dars/rasm/en45-u7-orange-fruit.webp";
import d_en45_u7_potato from "./dars/rasm/en45-u7-potato.webp";
import d_en45_u7_strawberry from "./dars/rasm/en45-u7-strawberry.webp";
import d_en45_u7_tomato from "./dars/rasm/en45-u7-tomato.webp";
import d_en45_u7_yummy from "./dars/rasm/en45-u7-yummy.webp";
import d_en45_u8_ball from "./dars/rasm/en45-u8-ball.webp";
import d_en45_u8_doll from "./dars/rasm/en45-u8-doll.webp";
import d_en45_u8_dress from "./dars/rasm/en45-u8-dress.webp";
import d_en45_u8_hat from "./dars/rasm/en45-u8-hat.webp";
import d_en45_u8_i_like_my_teddy from "./dars/rasm/en45-u8-i-like-my-teddy.webp";
import d_en45_u8_its_a_ball from "./dars/rasm/en45-u8-its-a-ball.webp";
import d_en45_u8_kite from "./dars/rasm/en45-u8-kite.webp";
import d_en45_u8_robot from "./dars/rasm/en45-u8-robot.webp";
import d_en45_u8_shoes from "./dars/rasm/en45-u8-shoes.webp";
import d_en45_u8_socks from "./dars/rasm/en45-u8-socks.webp";
import d_en45_u8_t_shirt from "./dars/rasm/en45-u8-t-shirt.webp";
import d_en45_u8_trousers from "./dars/rasm/en45-u8-trousers.webp";
import d_en45_u8_what_is_it from "./dars/rasm/en45-u8-what-is-it.webp";
import d_en56_s4_breakfast from "./dars/rasm/en56-s4-breakfast.webp";
import d_en56_s5_find_the_kitten from "./dars/rasm/en56-s5-find-the-kitten.webp";
import d_en56_s6_park_weather from "./dars/rasm/en56-s6-park-weather.webp";
import d_en56_u4_bread from "./dars/rasm/en56-u4-bread.webp";
import d_en56_u4_cake from "./dars/rasm/en56-u4-cake.webp";
import d_en56_u4_cheese from "./dars/rasm/en56-u4-cheese.webp";
import d_en56_u4_chicken from "./dars/rasm/en56-u4-chicken.webp";
import d_en56_u4_egg from "./dars/rasm/en56-u4-egg.webp";
import d_en56_u4_ice_cream from "./dars/rasm/en56-u4-ice-cream.webp";
import d_en56_u4_im_hungry from "./dars/rasm/en56-u4-im-hungry.webp";
import d_en56_u4_im_thirsty from "./dars/rasm/en56-u4-im-thirsty.webp";
import d_en56_u4_juice from "./dars/rasm/en56-u4-juice.webp";
import d_en56_u4_milk from "./dars/rasm/en56-u4-milk.webp";
import d_en56_u4_rice from "./dars/rasm/en56-u4-rice.webp";
import d_en56_u4_soup from "./dars/rasm/en56-u4-soup.webp";
import d_en56_u4_sweets from "./dars/rasm/en56-u4-sweets.webp";
import d_en56_u4_tea from "./dars/rasm/en56-u4-tea.webp";
import d_en56_u4_water from "./dars/rasm/en56-u4-water.webp";
import d_en56_u4_yummy from "./dars/rasm/en56-u4-yummy.webp";
import d_en56_u5_bathroom from "./dars/rasm/en56-u5-bathroom.webp";
import d_en56_u5_bedroom from "./dars/rasm/en56-u5-bedroom.webp";
import d_en56_u5_chair from "./dars/rasm/en56-u5-chair.webp";
import d_en56_u5_clock from "./dars/rasm/en56-u5-clock.webp";
import d_en56_u5_door from "./dars/rasm/en56-u5-door.webp";
import d_en56_u5_garden from "./dars/rasm/en56-u5-garden.webp";
import d_en56_u5_house from "./dars/rasm/en56-u5-house.webp";
import d_en56_u5_in_box from "./dars/rasm/en56-u5-in-box.webp";
import d_en56_u5_kitchen from "./dars/rasm/en56-u5-kitchen.webp";
import d_en56_u5_lamp from "./dars/rasm/en56-u5-lamp.webp";
import d_en56_u5_living_room from "./dars/rasm/en56-u5-living-room.webp";
import d_en56_u5_on_table from "./dars/rasm/en56-u5-on-table.webp";
import d_en56_u5_tv from "./dars/rasm/en56-u5-tv.webp";
import d_en56_u5_under_bed from "./dars/rasm/en56-u5-under-bed.webp";
import d_en56_u5_where_cat from "./dars/rasm/en56-u5-where-cat.webp";
import d_en56_u5_window from "./dars/rasm/en56-u5-window.webp";
import d_en56_u6_autumn from "./dars/rasm/en56-u6-autumn.webp";
import d_en56_u6_cloudy from "./dars/rasm/en56-u6-cloudy.webp";
import d_en56_u6_cold from "./dars/rasm/en56-u6-cold.webp";
import d_en56_u6_hot from "./dars/rasm/en56-u6-hot.webp";
import d_en56_u6_rainbow from "./dars/rasm/en56-u6-rainbow.webp";
import d_en56_u6_rainy from "./dars/rasm/en56-u6-rainy.webp";
import d_en56_u6_snowman from "./dars/rasm/en56-u6-snowman.webp";
import d_en56_u6_snowy from "./dars/rasm/en56-u6-snowy.webp";
import d_en56_u6_spring from "./dars/rasm/en56-u6-spring.webp";
import d_en56_u6_summer from "./dars/rasm/en56-u6-summer.webp";
import d_en56_u6_sunny from "./dars/rasm/en56-u6-sunny.webp";
import d_en56_u6_umbrella from "./dars/rasm/en56-u6-umbrella.webp";
import d_en56_u6_weather from "./dars/rasm/en56-u6-weather.webp";
import d_en56_u6_windy from "./dars/rasm/en56-u6-windy.webp";
import d_en56_u6_winter from "./dars/rasm/en56-u6-winter.webp";
import d_en56_u8_i_am_happy from "./dars/rasm/en56-u8-i-am-happy.webp";
import d_en67_u7_here_you_are from "./dars/rasm/en67-u7-here-you-are.webp";
import d_en67_u7_youre_welcome from "./dars/rasm/en67-u7-youre-welcome.webp";
import d_mt34_u5_balandroq from "./dars/rasm/mt34-u5-balandroq.webp";
import d_mt34_u5_pastroq from "./dars/rasm/mt34-u5-pastroq.webp";
import d_mt34_u5_qisqa from "./dars/rasm/mt34-u5-qisqa.webp";
import d_mt34_u5_qisqaroq from "./dars/rasm/mt34-u5-qisqaroq.webp";
import d_mt34_u5_uzunroq from "./dars/rasm/mt34-u5-uzunroq.webp";
import d_mt34_u6_bogchaga from "./dars/rasm/mt34-u6-bogchaga.webp";
import d_am45_u6_kirpi from "./dars/rasm/am45-u6-kirpi.webp";
import d_am45_u6_oq_quyon from "./dars/rasm/am45-u6-oq-quyon.webp";
import d_am45_u6_qush_uychasi from "./dars/rasm/am45-u6-qush-uychasi.webp";
import d_am45_u6_yem from "./dars/rasm/am45-u6-yem.webp";
import d_am45_u6_zaxira from "./dars/rasm/am45-u6-zaxira.webp";
import d_am45_u7_dush from "./dars/rasm/am45-u7-dush.webp";
import d_am45_u7_gulga_suv from "./dars/rasm/am45-u7-gulga-suv.webp";
import d_am45_u7_jomrak from "./dars/rasm/am45-u7-jomrak.webp";
import d_am45_u7_tomchi from "./dars/rasm/am45-u7-tomchi.webp";
import d_am45_u8_101 from "./dars/rasm/am45-u8-101.webp";
import d_am45_u8_begona from "./dars/rasm/am45-u8-begona.webp";
import d_am45_u8_maydoncha from "./dars/rasm/am45-u8-maydoncha.webp";
import d_am45_u8_ota_onaga from "./dars/rasm/am45-u8-ota-onaga.webp";
import d_am45_u8_qizil from "./dars/rasm/am45-u8-qizil.webp";
import d_am45_u8_qol_ushlab from "./dars/rasm/am45-u8-qol-ushlab.webp";
import d_am45_u8_sariq from "./dars/rasm/am45-u8-sariq.webp";
import d_am45_u8_yashil from "./dars/rasm/am45-u8-yashil.webp";
import d_am45_u8_yoq_deymiz from "./dars/rasm/am45-u8-yoq-deymiz.webp";
import d_am45_u8_zebra from "./dars/rasm/am45-u8-zebra.webp";
import d_en45_s1_new_friend from "./dars/rasm/en45-s1-new-friend.webp";
import d_en45_s15_kindergarten_lunch from "./dars/rasm/en45-s15-kindergarten-lunch.webp";
import d_en45_s16_morning_ready from "./dars/rasm/en45-s16-morning-ready.webp";
import d_en45_s17_slide_turns from "./dars/rasm/en45-s17-slide-turns.webp";
import d_en45_s2_painting_rainbow from "./dars/rasm/en45-s2-painting-rainbow.webp";
import d_en45_s3_park_ducks from "./dars/rasm/en45-s3-park-ducks.webp";
import d_en45_s4_zoo_granny from "./dars/rasm/en45-s4-zoo-granny.webp";
import d_en45_s5_visiting_grandma from "./dars/rasm/en45-s5-visiting-grandma.webp";
import d_en45_s6_morning_exercises from "./dars/rasm/en45-s6-morning-exercises.webp";
import d_en45_s7_fruit_market from "./dars/rasm/en45-s7-fruit-market.webp";
import d_en45_s8_dressing_for_park from "./dars/rasm/en45-s8-dressing-for-park.webp";
import d_en45_u1_blue from "./dars/rasm/en45-u1-blue.webp";
import d_en45_u1_good_morning from "./dars/rasm/en45-u1-good-morning.webp";
import d_en45_u1_goodbye from "./dars/rasm/en45-u1-goodbye.webp";
import d_en45_u1_green from "./dars/rasm/en45-u1-green.webp";
import d_en45_u1_hello from "./dars/rasm/en45-u1-hello.webp";
import d_en45_u1_how_are_you from "./dars/rasm/en45-u1-how-are-you.webp";
import d_en45_u1_im_fine from "./dars/rasm/en45-u1-im-fine.webp";
import d_en45_u1_my_name_is from "./dars/rasm/en45-u1-my-name-is.webp";
import d_en45_u1_red from "./dars/rasm/en45-u1-red.webp";
import d_en45_u1_thank_you from "./dars/rasm/en45-u1-thank-you.webp";
import d_en45_u1_whats_your_name from "./dars/rasm/en45-u1-whats-your-name.webp";
import d_en45_u1_yellow from "./dars/rasm/en45-u1-yellow.webp";
import d_en45_u12_can_i_have_a_ball_please from "./dars/rasm/en45-u12-can-i-have-a-ball-please.webp";
import d_en45_u12_excuse_me from "./dars/rasm/en45-u12-excuse-me.webp";
import d_en45_u12_no_thank_you from "./dars/rasm/en45-u12-no-thank-you.webp";
import d_en45_u12_thats_ok from "./dars/rasm/en45-u12-thats-ok.webp";
import d_en45_u12_yes_please from "./dars/rasm/en45-u12-yes-please.webp";
import d_en45_u13_bag from "./dars/rasm/en45-u13-bag.webp";
import d_en45_u13_bath from "./dars/rasm/en45-u13-bath.webp";
import d_en45_u13_breakfast from "./dars/rasm/en45-u13-breakfast.webp";
import d_en45_u13_dinner from "./dars/rasm/en45-u13-dinner.webp";
import d_en45_u13_go_to_bed from "./dars/rasm/en45-u13-go-to-bed.webp";
import d_en45_u13_i_go_to_kindergarten from "./dars/rasm/en45-u13-i-go-to-kindergarten.webp";
import d_en45_u13_lets_go from "./dars/rasm/en45-u13-lets-go.webp";
import d_en45_u13_wake_up from "./dars/rasm/en45-u13-wake-up.webp";
import d_en45_u14_angry from "./dars/rasm/en45-u14-angry.webp";
import d_en45_u14_be_my_friend from "./dars/rasm/en45-u14-be-my-friend.webp";
import d_en45_u14_how_do_you_feel from "./dars/rasm/en45-u14-how-do-you-feel.webp";
import d_en45_u14_lets_play_together from "./dars/rasm/en45-u14-lets-play-together.webp";
import d_en45_u14_my_turn from "./dars/rasm/en45-u14-my-turn.webp";
import d_en45_u14_your_turn from "./dars/rasm/en45-u14-your-turn.webp";
import d_en45_u2_black from "./dars/rasm/en45-u2-black.webp";
import d_en45_u2_brown from "./dars/rasm/en45-u2-brown.webp";
import d_en45_u2_grey from "./dars/rasm/en45-u2-grey.webp";
import d_en45_u2_orange_color from "./dars/rasm/en45-u2-orange-color.webp";
import d_en45_u2_pink from "./dars/rasm/en45-u2-pink.webp";
import d_en45_u2_purple from "./dars/rasm/en45-u2-purple.webp";
import d_en45_u2_rainbow from "./dars/rasm/en45-u2-rainbow.webp";
import d_en45_u2_what_colour from "./dars/rasm/en45-u2-what-colour.webp";
import d_en45_u2_white from "./dars/rasm/en45-u2-white.webp";
import d_en45_u3_eight from "./dars/rasm/en45-u3-eight.webp";
import d_en45_u3_five from "./dars/rasm/en45-u3-five.webp";
import d_en45_u3_four from "./dars/rasm/en45-u3-four.webp";
import d_en45_u3_how_many from "./dars/rasm/en45-u3-how-many.webp";
import d_en45_u3_nine from "./dars/rasm/en45-u3-nine.webp";
import d_en45_u3_one from "./dars/rasm/en45-u3-one.webp";
import d_en45_u3_seven from "./dars/rasm/en45-u3-seven.webp";
import d_en45_u3_six from "./dars/rasm/en45-u3-six.webp";
import d_en45_u3_ten from "./dars/rasm/en45-u3-ten.webp";
import d_en45_u3_three from "./dars/rasm/en45-u3-three.webp";
import d_en45_u3_two from "./dars/rasm/en45-u3-two.webp";
import d_en45_u4_bear from "./dars/rasm/en45-u4-bear.webp";
import d_en45_u4_crocodile from "./dars/rasm/en45-u4-crocodile.webp";
import d_en45_u4_elephant from "./dars/rasm/en45-u4-elephant.webp";
import d_en45_u4_fox from "./dars/rasm/en45-u4-fox.webp";
import d_en45_u4_giraffe from "./dars/rasm/en45-u4-giraffe.webp";
import d_en45_u4_lion from "./dars/rasm/en45-u4-lion.webp";
import d_en45_u4_monkey from "./dars/rasm/en45-u4-monkey.webp";
import d_en45_u4_owl from "./dars/rasm/en45-u4-owl.webp";
import d_en45_u4_snake from "./dars/rasm/en45-u4-snake.webp";
import d_en45_u4_tiger from "./dars/rasm/en45-u4-tiger.webp";
import d_en45_u4_wolf from "./dars/rasm/en45-u4-wolf.webp";
import d_en45_u4_zebra from "./dars/rasm/en45-u4-zebra.webp";
import d_en45_u5_baby from "./dars/rasm/en45-u5-baby.webp";
import d_en45_u5_brother from "./dars/rasm/en45-u5-brother.webp";
import d_en45_u5_family from "./dars/rasm/en45-u5-family.webp";
import d_en45_u5_father from "./dars/rasm/en45-u5-father.webp";
import d_en45_u5_grandma from "./dars/rasm/en45-u5-grandma.webp";
import d_en45_u5_grandpa from "./dars/rasm/en45-u5-grandpa.webp";
import d_en45_u5_mother from "./dars/rasm/en45-u5-mother.webp";
import d_am23_u1_baliqcha from "./dars/rasm/am23-u1-baliqcha.webp";
import d_am23_u1_it from "./dars/rasm/am23-u1-it.webp";
import d_am23_u6_qordan_odam from "./dars/rasm/am23-u6-qordan-odam.webp";
import d_am23_u7_piyola from "./dars/rasm/am23-u7-piyola.webp";
import d_am23_u8_qol from "./dars/rasm/am23-u8-qol.webp";
import d_am23_u8_quloq from "./dars/rasm/am23-u8-quloq.webp";
import d_am23_u8_toza_qollar from "./dars/rasm/am23-u8-toza-qollar.webp";
import d_am23_u8_vanna from "./dars/rasm/am23-u8-vanna.webp";
import d_am34_u1_buzoq from "./dars/rasm/am34-u1-buzoq.webp";
import d_am34_u1_kuchukcha from "./dars/rasm/am34-u1-kuchukcha.webp";
import d_am34_u1_qozichoq from "./dars/rasm/am34-u1-qozichoq.webp";
import d_am34_u1_toychoq from "./dars/rasm/am34-u1-toychoq.webp";
import d_am34_u1_yovvoyi_hayvon from "./dars/rasm/am34-u1-yovvoyi-hayvon.webp";
import d_am34_u2_boyqush from "./dars/rasm/am34-u2-boyqush.webp";
import d_am34_u2_chumchuq from "./dars/rasm/am34-u2-chumchuq.webp";
import d_am34_u2_kabutar from "./dars/rasm/am34-u2-kabutar.webp";
import d_am34_u4_bulutli from "./dars/rasm/am34-u4-bulutli.webp";
import d_am34_u4_issiq from "./dars/rasm/am34-u4-issiq.webp";
import d_am34_u4_kurtka from "./dars/rasm/am34-u4-kurtka.webp";
import d_am34_u4_quyoshli from "./dars/rasm/am34-u4-quyoshli.webp";
import d_am34_u4_sovuq from "./dars/rasm/am34-u4-sovuq.webp";
import d_en23_u10_clap from "./dars/rasm/en23-u10-clap.webp";
import d_en23_u10_dance from "./dars/rasm/en23-u10-dance.webp";
import d_en23_u10_jump from "./dars/rasm/en23-u10-jump.webp";
import d_en23_u10_run from "./dars/rasm/en23-u10-run.webp";
import d_en23_u11_happy from "./dars/rasm/en23-u11-happy.webp";
import d_en23_u11_please from "./dars/rasm/en23-u11-please.webp";
import d_en23_u11_sad from "./dars/rasm/en23-u11-sad.webp";
import d_en23_u11_sorry from "./dars/rasm/en23-u11-sorry.webp";
import d_en23_u9_bed from "./dars/rasm/en23-u9-bed.webp";
import d_en23_u9_brush_your_teeth from "./dars/rasm/en23-u9-brush-your-teeth.webp";
import d_en23_u9_drink from "./dars/rasm/en23-u9-drink.webp";
import d_en23_u9_eat from "./dars/rasm/en23-u9-eat.webp";
import d_en23_u9_sleep from "./dars/rasm/en23-u9-sleep.webp";
import d_en23_u9_wash_your_hands from "./dars/rasm/en23-u9-wash-your-hands.webp";
import d_en34_u1_bye from "./dars/rasm/en34-u1-bye.webp";
import d_en34_u1_good_morning from "./dars/rasm/en34-u1-good-morning.webp";
import d_en34_u1_good_night from "./dars/rasm/en34-u1-good-night.webp";
import d_en34_u1_hello from "./dars/rasm/en34-u1-hello.webp";
import d_en34_u1_hi from "./dars/rasm/en34-u1-hi.webp";
import d_en34_u1_no from "./dars/rasm/en34-u1-no.webp";
import d_en34_u1_thank_you from "./dars/rasm/en34-u1-thank-you.webp";
import d_en34_u1_yes from "./dars/rasm/en34-u1-yes.webp";
import d_en34_u2_baby from "./dars/rasm/en34-u2-baby.webp";
import d_en34_u2_boy from "./dars/rasm/en34-u2-boy.webp";
import d_en34_u2_dad from "./dars/rasm/en34-u2-dad.webp";
import d_en34_u2_family from "./dars/rasm/en34-u2-family.webp";
import d_en34_u2_girl from "./dars/rasm/en34-u2-girl.webp";
import d_en34_u2_grandpa from "./dars/rasm/en34-u2-grandpa.webp";
import d_en34_u2_granny from "./dars/rasm/en34-u2-granny.webp";
import d_en34_u2_mum from "./dars/rasm/en34-u2-mum.webp";
import d_en34_u3_black from "./dars/rasm/en34-u3-black.webp";
import d_en34_u3_blue from "./dars/rasm/en34-u3-blue.webp";
import d_en34_u3_green from "./dars/rasm/en34-u3-green.webp";
import d_en34_u3_orange from "./dars/rasm/en34-u3-orange.webp";
import d_en34_u3_pink from "./dars/rasm/en34-u3-pink.webp";
import d_en34_u3_red from "./dars/rasm/en34-u3-red.webp";
import d_en34_u3_white from "./dars/rasm/en34-u3-white.webp";
import d_en34_u3_yellow from "./dars/rasm/en34-u3-yellow.webp";
import d_en34_u4_cat from "./dars/rasm/en34-u4-cat.webp";
import d_en34_u4_cow from "./dars/rasm/en34-u4-cow.webp";
import d_en34_u4_dog from "./dars/rasm/en34-u4-dog.webp";
import d_en34_u4_duck from "./dars/rasm/en34-u4-duck.webp";
import d_en34_u4_hen from "./dars/rasm/en34-u4-hen.webp";
import d_en34_u4_horse from "./dars/rasm/en34-u4-horse.webp";
import d_en34_u4_rabbit from "./dars/rasm/en34-u4-rabbit.webp";
import d_en34_u4_sheep from "./dars/rasm/en34-u4-sheep.webp";
import d_en34_u5_big from "./dars/rasm/en34-u5-big.webp";
import d_en34_u5_five from "./dars/rasm/en34-u5-five.webp";
import d_en34_u5_four from "./dars/rasm/en34-u5-four.webp";
import d_en34_u5_one from "./dars/rasm/en34-u5-one.webp";
import d_en34_u5_small from "./dars/rasm/en34-u5-small.webp";
import d_en34_u5_three from "./dars/rasm/en34-u5-three.webp";
import d_en34_u5_two from "./dars/rasm/en34-u5-two.webp";
import d_en34_u6_ball from "./dars/rasm/en34-u6-ball.webp";
import d_en34_u6_balloon from "./dars/rasm/en34-u6-balloon.webp";
import d_en34_u6_blocks from "./dars/rasm/en34-u6-blocks.webp";
import d_en34_u6_car from "./dars/rasm/en34-u6-car.webp";
import d_en34_u6_doll from "./dars/rasm/en34-u6-doll.webp";
import d_en34_u6_drum from "./dars/rasm/en34-u6-drum.webp";
import d_en34_u6_teddy from "./dars/rasm/en34-u6-teddy.webp";
import d_en34_u6_train from "./dars/rasm/en34-u6-train.webp";
import d_en34_u7_ears from "./dars/rasm/en34-u7-ears.webp";
import d_en34_u7_eyes from "./dars/rasm/en34-u7-eyes.webp";
import d_en34_u7_feet from "./dars/rasm/en34-u7-feet.webp";
import d_en34_u7_hands from "./dars/rasm/en34-u7-hands.webp";
import d_en34_u7_head from "./dars/rasm/en34-u7-head.webp";
import d_en34_u7_legs from "./dars/rasm/en34-u7-legs.webp";
import d_en34_u7_mouth from "./dars/rasm/en34-u7-mouth.webp";
import d_en34_u7_nose from "./dars/rasm/en34-u7-nose.webp";
import d_en34_u8_apple from "./dars/rasm/en34-u8-apple.webp";
import d_en34_u8_banana from "./dars/rasm/en34-u8-banana.webp";
import d_en34_u8_bread from "./dars/rasm/en34-u8-bread.webp";
import d_en34_u8_cake from "./dars/rasm/en34-u8-cake.webp";
import d_en34_u8_juice from "./dars/rasm/en34-u8-juice.webp";
import d_en34_u8_milk from "./dars/rasm/en34-u8-milk.webp";
import d_en34_u8_water from "./dars/rasm/en34-u8-water.webp";
import d_en34_u8_yummy from "./dars/rasm/en34-u8-yummy.webp";
import d_mt23_u1_bitta from "./dars/rasm/mt23-u1-bitta.webp";
import d_mt23_u1_bittadan from "./dars/rasm/mt23-u1-bittadan.webp";
import d_am56_u7_gul from "./dars/rasm/am56-u7-gul.webp";
import d_am56_u7_kochat from "./dars/rasm/am56-u7-kochat.webp";
import d_am56_u7_kompost from "./dars/rasm/am56-u7-kompost.webp";
import d_am56_u7_plastik2 from "./dars/rasm/am56-u7-plastik2.webp";
import d_am56_u7_qayta from "./dars/rasm/am56-u7-qayta.webp";
import d_am56_u7_qogoz from "./dars/rasm/am56-u7-qogoz.webp";
import d_am56_u7_qushlar from "./dars/rasm/am56-u7-qushlar.webp";
import d_am56_u7_shisha from "./dars/rasm/am56-u7-shisha.webp";
import d_am56_u7_tozalik from "./dars/rasm/am56-u7-tozalik.webp";
import d_am56_u8_bog from "./dars/rasm/am56-u8-bog.webp";
import d_am56_u8_manzil from "./dars/rasm/am56-u8-manzil.webp";
import d_am56_u8_qoshni from "./dars/rasm/am56-u8-qoshni.webp";
import d_am56_u8_sotuvchi from "./dars/rasm/am56-u8-sotuvchi.webp";
import d_am67_u1_aylanish from "./dars/rasm/am67-u1-aylanish.webp";
import d_am67_u1_bug from "./dars/rasm/am67-u1-bug.webp";
import d_am67_u1_buglanish from "./dars/rasm/am67-u1-buglanish.webp";
import d_am67_u1_dengiz from "./dars/rasm/am67-u1-dengiz.webp";
import d_am67_u1_sovish from "./dars/rasm/am67-u1-sovish.webp";
import d_am67_u2_kunduz from "./dars/rasm/am67-u2-kunduz.webp";
import d_am67_u2_nur from "./dars/rasm/am67-u2-nur.webp";
import d_am67_u2_oq from "./dars/rasm/am67-u2-oq.webp";
import d_am67_u2_orbita from "./dars/rasm/am67-u2-orbita.webp";
import d_am67_u2_qiyalik from "./dars/rasm/am67-u2-qiyalik.webp";
import d_am67_u2_yer from "./dars/rasm/am67-u2-yer.webp";
import d_am67_u3_asalari from "./dars/rasm/am67-u3-asalari.webp";
import d_am67_u3_ildiz from "./dars/rasm/am67-u3-ildiz.webp";
import d_am67_u3_intilish from "./dars/rasm/am67-u3-intilish.webp";
import d_am67_u3_poya from "./dars/rasm/am67-u3-poya.webp";
import d_am67_u3_shimish from "./dars/rasm/am67-u3-shimish.webp";
import d_am67_u3_solish from "./dars/rasm/am67-u3-solish.webp";
import d_am67_u3_sugorish from "./dars/rasm/am67-u3-sugorish.webp";
import d_am67_u3_unish from "./dars/rasm/am67-u3-unish.webp";
import d_am67_u3_yashil from "./dars/rasm/am67-u3-yashil.webp";
import d_am67_u3_yoruglik from "./dars/rasm/am67-u3-yoruglik.webp";
import d_am67_u4_ayiq from "./dars/rasm/am67-u4-ayiq.webp";
import d_am67_u4_bugu from "./dars/rasm/am67-u4-bugu.webp";
import d_am67_u4_echkemar from "./dars/rasm/am67-u4-echkemar.webp";
import d_am67_u4_jayron from "./dars/rasm/am67-u4-jayron.webp";
import d_am67_u4_kamyob from "./dars/rasm/am67-u4-kamyob.webp";
import d_am67_u4_laylak from "./dars/rasm/am67-u4-laylak.webp";
import d_am67_u4_morxor from "./dars/rasm/am67-u4-morxor.webp";
import d_am67_u4_qizilkitob from "./dars/rasm/am67-u4-qizilkitob.webp";
import d_am67_u4_qoriqxona from "./dars/rasm/am67-u4-qoriqxona.webp";
import d_am67_u4_toqay from "./dars/rasm/am67-u4-toqay.webp";
import d_am67_u4_yordam from "./dars/rasm/am67-u4-yordam.webp";
import d_am67_u5_chelak from "./dars/rasm/am67-u5-chelak.webp";
import d_am67_u5_chiroq from "./dars/rasm/am67-u5-chiroq.webp";
import d_am67_u5_dush from "./dars/rasm/am67-u5-dush.webp";
import d_am67_u5_ichimlik from "./dars/rasm/am67-u5-ichimlik.webp";
import d_am67_u5_panel from "./dars/rasm/am67-u5-panel.webp";
import d_am67_u5_rozetka from "./dars/rasm/am67-u5-rozetka.webp";
import d_am67_u5_stansiya from "./dars/rasm/am67-u5-stansiya.webp";
import d_am67_u5_televizor from "./dars/rasm/am67-u5-televizor.webp";
import d_am67_u5_tish from "./dars/rasm/am67-u5-tish.webp";
import d_am67_u5_tomchi from "./dars/rasm/am67-u5-tomchi.webp";
import d_am67_u5_tozalash from "./dars/rasm/am67-u5-tozalash.webp";
import d_am67_u6_daryolar from "./dars/rasm/am67-u6-daryolar.webp";
import d_am67_u6_ipakyoli from "./dars/rasm/am67-u6-ipakyoli.webp";
import d_am67_u6_qizilqum from "./dars/rasm/am67-u6-qizilqum.webp";
import d_am67_u6_toglar from "./dars/rasm/am67-u6-toglar.webp";
import d_am67_u6_toshkent from "./dars/rasm/am67-u6-toshkent.webp";
import d_am67_u6_xiva from "./dars/rasm/am67-u6-xiva.webp";
import d_am67_u7_foydali from "./dars/rasm/am67-u7-foydali.webp";
import d_am67_u7_nafas from "./dars/rasm/am67-u7-nafas.webp";
import d_am67_u7_oshqozon from "./dars/rasm/am67-u7-oshqozon.webp";
import d_am67_u7_puls from "./dars/rasm/am67-u7-puls.webp";
import d_am67_u7_qon from "./dars/rasm/am67-u7-qon.webp";
import d_am67_u7_quloq from "./dars/rasm/am67-u7-quloq.webp";
import d_am67_u7_tish from "./dars/rasm/am67-u7-tish.webp";
import d_am67_u7_tozahavo from "./dars/rasm/am67-u7-tozahavo.webp";
import d_am67_u7_yurak from "./dars/rasm/am67-u7-yurak.webp";
import d_am67_u8_aks from "./dars/rasm/am67-u8-aks.webp";
import d_am67_u8_fonar from "./dars/rasm/am67-u8-fonar.webp";
import d_am67_u8_qisqich from "./dars/rasm/am67-u8-qisqich.webp";
import d_am67_u8_ranglar from "./dars/rasm/am67-u8-ranglar.webp";
import d_am67_u8_teatr from "./dars/rasm/am67-u8-teatr.webp";
import d_am67_u8_tomchinur from "./dars/rasm/am67-u8-tomchinur.webp";
import d_am67_u8_zaychik from "./dars/rasm/am67-u8-zaychik.webp";
import d_en56_s7_market from "./dars/rasm/en56-s7-market.webp";
import d_en56_s8_birthday_party from "./dars/rasm/en56-s8-birthday-party.webp";
import d_en56_u7_dislike_onions from "./dars/rasm/en56-u7-dislike-onions.webp";
import d_en56_u7_dislike_rain from "./dars/rasm/en56-u7-dislike-rain.webp";
import d_en56_u7_dislike_spiders from "./dars/rasm/en56-u7-dislike-spiders.webp";
import d_en56_u7_do_you_like from "./dars/rasm/en56-u7-do-you-like.webp";
import d_en56_u7_favourite_colour from "./dars/rasm/en56-u7-favourite-colour.webp";
import d_en56_u7_favourite_toy from "./dars/rasm/en56-u7-favourite-toy.webp";
import d_en56_u7_like_apples from "./dars/rasm/en56-u7-like-apples.webp";
import d_en56_u7_like_cats from "./dars/rasm/en56-u7-like-cats.webp";
import d_en56_u7_like_ice_cream from "./dars/rasm/en56-u7-like-ice-cream.webp";
import d_en56_u7_love_mum from "./dars/rasm/en56-u7-love-mum.webp";
import d_en56_u7_no_i_dont from "./dars/rasm/en56-u7-no-i-dont.webp";
import d_en56_u7_yes_i_do from "./dars/rasm/en56-u7-yes-i-do.webp";
import d_en56_u8_can_clap from "./dars/rasm/en56-u8-can-clap.webp";
import d_en56_u8_can_dance from "./dars/rasm/en56-u8-can-dance.webp";
import d_en56_u8_can_draw from "./dars/rasm/en56-u8-can-draw.webp";
import d_en56_u8_can_jump from "./dars/rasm/en56-u8-can-jump.webp";
import d_en56_u8_can_run from "./dars/rasm/en56-u8-can-run.webp";
import d_en56_u8_can_sing from "./dars/rasm/en56-u8-can-sing.webp";
import d_en56_u8_can_swim from "./dars/rasm/en56-u8-can-swim.webp";
import d_en56_u8_cant_fly from "./dars/rasm/en56-u8-cant-fly.webp";
// REV261: maktab (1–11-sinf) va fanlar rasmlari 1001–2200 (rassom)
import d_m_shamolli from "./dars/rasm/m-shamolli.webp";
import d_m_shanba from "./dars/rasm/m-shanba.webp";
import d_m_shippak from "./dars/rasm/m-shippak.webp";
import d_m_shlyapa from "./dars/rasm/m-shlyapa.webp";
import d_m_sichqon from "./dars/rasm/m-sichqon.webp";
import d_m_sichqoncha from "./dars/rasm/m-sichqoncha.webp";
import d_m_stol from "./dars/rasm/m-stol.webp";
import d_m_tabassum from "./dars/rasm/m-tabassum.webp";
import d_m_tanaffus from "./dars/rasm/m-tanaffus.webp";
import d_m_tepmoq from "./dars/rasm/m-tepmoq.webp";
import d_m_tirmashib_chiqish from "./dars/rasm/m-tirmashib-chiqish.webp";
import d_m_tirmashmoq from "./dars/rasm/m-tirmashmoq.webp";
import d_m_tufli from "./dars/rasm/m-tufli.webp";
import d_m_tufli_poyabzal from "./dars/rasm/m-tufli-poyabzal.webp";
import d_m_u_yerda from "./dars/rasm/m-u-yerda.webp";
import d_m_uchish from "./dars/rasm/m-uchish.webp";
import d_m_ular from "./dars/rasm/m-ular.webp";
import d_m_ular_qayerda from "./dars/rasm/m-ular-qayerda.webp";
import d_m_ustida from "./dars/rasm/m-ustida.webp";
import d_m_uxlamoq from "./dars/rasm/m-uxlamoq.webp";
import d_m_uxlash from "./dars/rasm/m-uxlash.webp";
import d_m_uyqum_keldi from "./dars/rasm/m-uyqum-keldi.webp";
import d_m_qahva from "./dars/rasm/m-qahva.webp";
import d_m_qancha from "./dars/rasm/m-qancha.webp";
import d_m_qancha_turadi from "./dars/rasm/m-qancha-turadi.webp";
import d_m_qanday_borsa_boladi from "./dars/rasm/m-qanday-borsa-boladi.webp";
import d_m_qaytim from "./dars/rasm/m-qaytim.webp";
import d_m_qidirmoq from "./dars/rasm/m-qidirmoq.webp";
import d_m_qirq from "./dars/rasm/m-qirq.webp";
import d_m_qishloq_joy from "./dars/rasm/m-qishloq-joy.webp";
import d_m_qishloq_joy_dala from "./dars/rasm/m-qishloq-joy-dala.webp";
import d_m_qongir_kashtan_rang from "./dars/rasm/m-qongir-kashtan-rang.webp";
import d_m_qongiroq_qilmoq from "./dars/rasm/m-qongiroq-qilmoq.webp";
import d_m_qor_bobo from "./dars/rasm/m-qor-bobo.webp";
import d_m_qora_sochli_qoramagiz from "./dars/rasm/m-qora-sochli-qoramagiz.webp";
import d_m_qora_sochli_qoramtir from "./dars/rasm/m-qora-sochli-qoramtir.webp";
import d_m_qoshlar from "./dars/rasm/m-qoshlar.webp";
import d_m_qozon from "./dars/rasm/m-qozon.webp";
import d_m_quloqchinlar from "./dars/rasm/m-quloqchinlar.webp";
import d_m_quymoq from "./dars/rasm/m-quymoq.webp";
import d_m_quyoshda_toblanmoq from "./dars/rasm/m-quyoshda-toblanmoq.webp";
import d_m_roparasida from "./dars/rasm/m-roparasida.webp";
import d_m_sahna from "./dars/rasm/m-sahna.webp";
import d_m_salfetka from "./dars/rasm/m-salfetka.webp";
import d_m_sariq_sochli from "./dars/rasm/m-sariq-sochli.webp";
import d_m_sariyog from "./dars/rasm/m-sariyog.webp";
import d_m_savol from "./dars/rasm/m-savol.webp";
import d_m_sentabr from "./dars/rasm/m-sentabr.webp";
import d_m_sentyabr from "./dars/rasm/m-sentyabr.webp";
import d_m_sepkillar from "./dars/rasm/m-sepkillar.webp";
import d_m_sevimli from "./dars/rasm/m-sevimli.webp";
import d_m_shahar_xaritasi from "./dars/rasm/m-shahar-xaritasi.webp";
import d_m_shisha from "./dars/rasm/m-shisha.webp";
import d_m_shisha_butilka from "./dars/rasm/m-shisha-butilka.webp";
import d_m_shivirlamoq from "./dars/rasm/m-shivirlamoq.webp";
import d_m_shokolad from "./dars/rasm/m-shokolad.webp";
import d_m_shovqin from "./dars/rasm/m-shovqin.webp";
import d_m_silliq_togri from "./dars/rasm/m-silliq-togri.webp";
import d_m_sir from "./dars/rasm/m-sir.webp";
import d_m_sirk from "./dars/rasm/m-sirk.webp";
import d_m_sirpanchiq from "./dars/rasm/m-sirpanchiq.webp";
import d_m_som from "./dars/rasm/m-som.webp";
import d_m_soqmoq from "./dars/rasm/m-soqmoq.webp";
import d_m_soramoq from "./dars/rasm/m-soramoq.webp";
import d_m_soch_taramoq from "./dars/rasm/m-soch-taramoq.webp";
import d_m_sochini_taramoq from "./dars/rasm/m-sochini-taramoq.webp";
import d_m_sotmoq from "./dars/rasm/m-sotmoq.webp";
import d_m_sotuvchi from "./dars/rasm/m-sotuvchi.webp";
import d_m_sovga_qilmoq from "./dars/rasm/m-sovga-qilmoq.webp";
import d_m_soy_kichik_daryo from "./dars/rasm/m-soy-kichik-daryo.webp";
import d_m_supurmoq from "./dars/rasm/m-supurmoq.webp";
import d_m_tatil from "./dars/rasm/m-tatil.webp";
import d_m_tabriklamoq from "./dars/rasm/m-tabriklamoq.webp";
import d_m_tabriklayman from "./dars/rasm/m-tabriklayman.webp";
import d_m_tabriknoma from "./dars/rasm/m-tabriknoma.webp";
import d_m_taklif_qilmoq from "./dars/rasm/m-taklif-qilmoq.webp";
import d_m_tayyorlamoq from "./dars/rasm/m-tayyorlamoq.webp";
import d_m_teatr from "./dars/rasm/m-teatr.webp";
import d_m_tekis_silliq from "./dars/rasm/m-tekis-silliq.webp";
import d_m_tepalikdan_sirpanchiq from "./dars/rasm/m-tepalikdan-sirpanchiq.webp";
import d_m_terib_olmoq from "./dars/rasm/m-terib-olmoq.webp";
import d_m_termoq_yigmoq from "./dars/rasm/m-termoq-yigmoq.webp";
import d_m_tez_tez from "./dars/rasm/m-tez-tez.webp";
import d_m_tez_tez_kopincha from "./dars/rasm/m-tez-tez-kopincha.webp";
import d_m_tik_turgan from "./dars/rasm/m-tik-turgan.webp";
import d_m_tik_turmoq from "./dars/rasm/m-tik-turmoq.webp";
import d_m_togarak_klub from "./dars/rasm/m-togarak-klub.webp";
import d_m_tolamoq from "./dars/rasm/m-tolamoq.webp";
import d_m_toq_rangli from "./dars/rasm/m-toq-rangli.webp";
import d_m_topmoq from "./dars/rasm/m-topmoq.webp";
import d_m_tushmoq_yiqilmoq from "./dars/rasm/m-tushmoq-yiqilmoq.webp";
import d_m_uyatchan from "./dars/rasm/m-uyatchan.webp";
import d_m_uzmoq from "./dars/rasm/m-uzmoq.webp";
import d_m_video_oyinlar from "./dars/rasm/m-video-oyinlar.webp";
import d_m_viktorina from "./dars/rasm/m-viktorina.webp";
import d_m_vokzal from "./dars/rasm/m-vokzal.webp";
import d_m_xarid_qilmoq from "./dars/rasm/m-xarid-qilmoq.webp";
import d_m_xarid_royxati from "./dars/rasm/m-xarid-royxati.webp";
import d_m_xaridlar_royxati from "./dars/rasm/m-xaridlar-royxati.webp";
import d_m_xaridor from "./dars/rasm/m-xaridor.webp";
import d_m_xat from "./dars/rasm/m-xat.webp";
import d_m_yana_biror_narsa from "./dars/rasm/m-yana-biror-narsa.webp";
import d_m_yangi_yil from "./dars/rasm/m-yangi-yil.webp";
import d_m_yanvar from "./dars/rasm/m-yanvar.webp";
import d_m_yarim_tun from "./dars/rasm/m-yarim-tun.webp";
import d_m_yashirinmoq from "./dars/rasm/m-yashirinmoq.webp";
import d_m_yolak_soqmoq from "./dars/rasm/m-yolak-soqmoq.webp";
import d_m_yolovchi from "./dars/rasm/m-yolovchi.webp";
import d_m_yog from "./dars/rasm/m-yog.webp";
import d_m_yogurt from "./dars/rasm/m-yogurt.webp";
import d_m_yogurt_qatiq from "./dars/rasm/m-yogurt-qatiq.webp";
import d_m_yordamchi from "./dars/rasm/m-yordamchi.webp";
import d_m_yozmoq from "./dars/rasm/m-yozmoq.webp";
import d_m_gacha from "./dars/rasm/m-gacha.webp";
import d_mat_sanoq_chopi from "./dars/rasm/mat-sanoq-chopi.webp";
import d_mat_onlik_boglam from "./dars/rasm/mat-onlik-boglam.webp";
import d_mat_abak from "./dars/rasm/mat-abak.webp";
import d_mat_son_oqi from "./dars/rasm/mat-son-oqi.webp";
import d_mat_yuzlik_jadval from "./dars/rasm/mat-yuzlik-jadval.webp";
import d_mat_kasr_pitsa_yarim from "./dars/rasm/mat-kasr-pitsa-yarim.webp";
import d_mat_kasr_pitsa_chorak from "./dars/rasm/mat-kasr-pitsa-chorak.webp";
import d_mat_kasr_pitsa_uchdan from "./dars/rasm/mat-kasr-pitsa-uchdan.webp";
import d_mat_kasr_tasma from "./dars/rasm/mat-kasr-tasma.webp";
import d_mat_tarozi_palla from "./dars/rasm/mat-tarozi-palla.webp";
import d_mat_tarozi_ogir from "./dars/rasm/mat-tarozi-ogir.webp";
import d_mat_sirkul from "./dars/rasm/mat-sirkul.webp";
import d_mat_transportir from "./dars/rasm/mat-transportir.webp";
import d_mat_burchakli_chizgich from "./dars/rasm/mat-burchakli-chizgich.webp";
import d_mat_ruletka from "./dars/rasm/mat-ruletka.webp";
import d_mat_menzurka_litr from "./dars/rasm/mat-menzurka-litr.webp";
import d_mat_soat_bosh from "./dars/rasm/mat-soat-bosh.webp";
import d_mat_soat_mil_katta from "./dars/rasm/mat-soat-mil-katta.webp";
import d_mat_soat_mil_kichik from "./dars/rasm/mat-soat-mil-kichik.webp";
import d_mat_kalendar_oy from "./dars/rasm/mat-kalendar-oy.webp";
import d_mat_simmetriya_kapalak from "./dars/rasm/mat-simmetriya-kapalak.webp";
import d_mat_burchak_otkir from "./dars/rasm/mat-burchak-otkir.webp";
import d_mat_burchak_togri from "./dars/rasm/mat-burchak-togri.webp";
import d_mat_burchak_otmas from "./dars/rasm/mat-burchak-otmas.webp";
import d_mat_perimetr_panjara from "./dars/rasm/mat-perimetr-panjara.webp";
import d_mat_yuza_panjara from "./dars/rasm/mat-yuza-panjara.webp";
import d_mat_diagramma_doira from "./dars/rasm/mat-diagramma-doira.webp";
import d_mat_diagramma_chiziq from "./dars/rasm/mat-diagramma-chiziq.webp";
import d_mat_piktogramma from "./dars/rasm/mat-piktogramma.webp";
import d_mat_jadval_bosh from "./dars/rasm/mat-jadval-bosh.webp";
import d_mat_kub_yoyilma from "./dars/rasm/mat-kub-yoyilma.webp";
import d_mat_piramida from "./dars/rasm/mat-piramida.webp";
import d_mat_konus from "./dars/rasm/mat-konus.webp";
import d_mat_parallelepiped from "./dars/rasm/mat-parallelepiped.webp";
import d_mat_romb from "./dars/rasm/mat-romb.webp";
import d_mat_trapetsiya from "./dars/rasm/mat-trapetsiya.webp";
import d_mat_oltiburchak from "./dars/rasm/mat-oltiburchak.webp";
import d_mat_beshburchak from "./dars/rasm/mat-beshburchak.webp";
import d_mat_koordinata from "./dars/rasm/mat-koordinata.webp";
import d_mat_grafik_chiziqli from "./dars/rasm/mat-grafik-chiziqli.webp";
import d_mat_grafik_parabola from "./dars/rasm/mat-grafik-parabola.webp";
import d_mat_tenglama_tarozi from "./dars/rasm/mat-tenglama-tarozi.webp";
import d_mat_aylana_qismlari from "./dars/rasm/mat-aylana-qismlari.webp";
import d_mat_uchburchak_turlari from "./dars/rasm/mat-uchburchak-turlari.webp";
import d_mat_pifagor from "./dars/rasm/mat-pifagor.webp";
import d_mat_prizma from "./dars/rasm/mat-prizma.webp";
import d_mat_silindr_yoyilma from "./dars/rasm/mat-silindr-yoyilma.webp";
import d_mat_vektor from "./dars/rasm/mat-vektor.webp";
import d_mat_venn from "./dars/rasm/mat-venn.webp";
import d_mat_tanga_tashlash from "./dars/rasm/mat-tanga-tashlash.webp";
import d_mat_gistogramma from "./dars/rasm/mat-gistogramma.webp";
import d_mat_masshtab_xarita from "./dars/rasm/mat-masshtab-xarita.webp";
import d_mat_foiz_yuzlik from "./dars/rasm/mat-foiz-yuzlik.webp";
import d_mat_son_toplamlari from "./dars/rasm/mat-son-toplamlari.webp";
import d_mat_tezlik_poyezd from "./dars/rasm/mat-tezlik-poyezd.webp";
import d_mat_hovuz_quvur from "./dars/rasm/mat-hovuz-quvur.webp";
import d_fiz_kuch_itarish from "./dars/rasm/fiz-kuch-itarish.webp";
import d_fiz_kuch_tortish from "./dars/rasm/fiz-kuch-tortish.webp";
import d_fiz_ishqalanish from "./dars/rasm/fiz-ishqalanish.webp";
import d_fiz_ogirlik_kuchi from "./dars/rasm/fiz-ogirlik-kuchi.webp";
import d_fiz_richag from "./dars/rasm/fiz-richag.webp";
import d_fiz_blok from "./dars/rasm/fiz-blok.webp";
import d_fiz_qiya_tekislik from "./dars/rasm/fiz-qiya-tekislik.webp";
import d_fiz_dinamometr from "./dars/rasm/fiz-dinamometr.webp";
import d_fiz_bosim_suv from "./dars/rasm/fiz-bosim-suv.webp";
import d_fiz_arximed from "./dars/rasm/fiz-arximed.webp";
import d_fiz_spidometr from "./dars/rasm/fiz-spidometr.webp";
import d_fiz_energiya_turlari from "./dars/rasm/fiz-energiya-turlari.webp";
import d_fiz_issiqlik_otkazish from "./dars/rasm/fiz-issiqlik-otkazish.webp";
import d_fiz_konveksiya from "./dars/rasm/fiz-konveksiya.webp";
import d_fiz_nurlanish from "./dars/rasm/fiz-nurlanish.webp";
import d_fiz_agregat_holatlar from "./dars/rasm/fiz-agregat-holatlar.webp";
import d_fiz_elektr_zanjir from "./dars/rasm/fiz-elektr-zanjir.webp";
import d_fiz_ketma_ket from "./dars/rasm/fiz-ketma-ket.webp";
import d_fiz_parallel from "./dars/rasm/fiz-parallel.webp";
import d_fiz_magnit_kompas from "./dars/rasm/fiz-magnit-kompas.webp";
import d_fiz_elektromagnit from "./dars/rasm/fiz-elektromagnit.webp";
import d_fiz_tovush_toglqini from "./dars/rasm/fiz-tovush-toglqini.webp";
import d_fiz_yoruglik_sinishi from "./dars/rasm/fiz-yoruglik-sinishi.webp";
import d_fiz_yoruglik_qaytishi from "./dars/rasm/fiz-yoruglik-qaytishi.webp";
import d_fiz_linza from "./dars/rasm/fiz-linza.webp";
import d_fiz_prizma_kamalak from "./dars/rasm/fiz-prizma-kamalak.webp";
import d_fiz_fasllar from "./dars/rasm/fiz-fasllar.webp";
import d_fiz_quyosh_paneli from "./dars/rasm/fiz-quyosh-paneli.webp";
import d_fiz_shamol_generator from "./dars/rasm/fiz-shamol-generator.webp";
import d_fiz_ges from "./dars/rasm/fiz-ges.webp";
import d_fiz_atom_model from "./dars/rasm/fiz-atom-model.webp";
import d_bio_osimlik_qismlari from "./dars/rasm/bio-osimlik-qismlari.webp";
import d_bio_fotosintez from "./dars/rasm/bio-fotosintez.webp";
import d_bio_gul_tuzilishi from "./dars/rasm/bio-gul-tuzilishi.webp";
import d_bio_urug_unishi from "./dars/rasm/bio-urug-unishi.webp";
import d_bio_hujayra_osimlik from "./dars/rasm/bio-hujayra-osimlik.webp";
import d_bio_hujayra_hayvon from "./dars/rasm/bio-hujayra-hayvon.webp";
import d_bio_bakteriya from "./dars/rasm/bio-bakteriya.webp";
import d_bio_zamburug from "./dars/rasm/bio-zamburug.webp";
import d_bio_hasharot_tuzilishi from "./dars/rasm/bio-hasharot-tuzilishi.webp";
import d_bio_baliq_tuzilishi from "./dars/rasm/bio-baliq-tuzilishi.webp";
import d_bio_oziq_zanjiri from "./dars/rasm/bio-oziq-zanjiri.webp";
import d_bio_ekotizim_orman from "./dars/rasm/bio-ekotizim-orman.webp";
import d_bio_ekotizim_chol from "./dars/rasm/bio-ekotizim-chol.webp";
import d_bio_ekotizim_kol from "./dars/rasm/bio-ekotizim-kol.webp";
import d_bio_skelet from "./dars/rasm/bio-skelet.webp";
import d_bio_muskullar from "./dars/rasm/bio-muskullar.webp";
import d_bio_yurak_qon from "./dars/rasm/bio-yurak-qon.webp";
import d_bio_hazm_tizimi from "./dars/rasm/bio-hazm-tizimi.webp";
import d_bio_miya_nerv from "./dars/rasm/bio-miya-nerv.webp";
import d_bio_koz_tuzilishi from "./dars/rasm/bio-koz-tuzilishi.webp";
import d_bio_quloq_tuzilishi from "./dars/rasm/bio-quloq-tuzilishi.webp";
import d_bio_dnk from "./dars/rasm/bio-dnk.webp";
import d_bio_mendel_noxat from "./dars/rasm/bio-mendel-noxat.webp";
import d_bio_ovqat_piramidasi from "./dars/rasm/bio-ovqat-piramidasi.webp";
import d_bio_emlash from "./dars/rasm/bio-emlash.webp";
import d_kim_atom_tuzilishi from "./dars/rasm/kim-atom-tuzilishi.webp";
import d_kim_molekula_suv from "./dars/rasm/kim-molekula-suv.webp";
import d_kim_molekula_co2 from "./dars/rasm/kim-molekula-co2.webp";
import d_kim_molekula_o2 from "./dars/rasm/kim-molekula-o2.webp";
import d_kim_molekula_metan from "./dars/rasm/kim-molekula-metan.webp";
import d_kim_davriy_jadval from "./dars/rasm/kim-davriy-jadval.webp";
import d_kim_probirka from "./dars/rasm/kim-probirka.webp";
import d_kim_kolba from "./dars/rasm/kim-kolba.webp";
import d_kim_menzurka from "./dars/rasm/kim-menzurka.webp";
import d_kim_spirt_lampa from "./dars/rasm/kim-spirt-lampa.webp";
import d_kim_shtativ from "./dars/rasm/kim-shtativ.webp";
import d_kim_voronka_filtr from "./dars/rasm/kim-voronka-filtr.webp";
import d_kim_pipetka from "./dars/rasm/kim-pipetka.webp";
import d_kim_himoya_kozoynak from "./dars/rasm/kim-himoya-kozoynak.webp";
import d_kim_filtrlash from "./dars/rasm/kim-filtrlash.webp";
import d_kim_buglatish from "./dars/rasm/kim-buglatish.webp";
import d_kim_distillash from "./dars/rasm/kim-distillash.webp";
import d_kim_reaksiya_rang from "./dars/rasm/kim-reaksiya-rang.webp";
import d_kim_reaksiya_gaz from "./dars/rasm/kim-reaksiya-gaz.webp";
import d_kim_reaksiya_chokma from "./dars/rasm/kim-reaksiya-chokma.webp";
import d_kim_lakmus from "./dars/rasm/kim-lakmus.webp";
import d_kim_ph_shkala from "./dars/rasm/kim-ph-shkala.webp";
import d_kim_olov_uchburchagi from "./dars/rasm/kim-olov-uchburchagi.webp";
import d_kim_zanglash from "./dars/rasm/kim-zanglash.webp";
import d_kim_eritma from "./dars/rasm/kim-eritma.webp";
import d_kim_kristall from "./dars/rasm/kim-kristall.webp";
import d_kim_belgi_yonuvchan from "./dars/rasm/kim-belgi-yonuvchan.webp";
import d_kim_belgi_zaharli from "./dars/rasm/kim-belgi-zaharli.webp";
import d_kim_belgi_korroziv from "./dars/rasm/kim-belgi-korroziv.webp";
import d_xb_dokon_chegirma from "./dars/rasm/xb-dokon-chegirma.webp";
import d_xb_avtobus_jadval from "./dars/rasm/xb-avtobus-jadval.webp";
import d_xb_xarita_marshrut from "./dars/rasm/xb-xarita-marshrut.webp";
import d_xb_retsept from "./dars/rasm/xb-retsept.webp";
import d_xb_ob_havo_grafik from "./dars/rasm/xb-ob-havo-grafik.webp";
import d_xb_telefon_tarif from "./dars/rasm/xb-telefon-tarif.webp";
import d_xb_velosiped_safar from "./dars/rasm/xb-velosiped-safar.webp";
import d_xb_bog_maydon from "./dars/rasm/xb-bog-maydon.webp";
import d_xb_suv_sarfi from "./dars/rasm/xb-suv-sarfi.webp";
import d_xb_elektr_hisoblagich from "./dars/rasm/xb-elektr-hisoblagich.webp";
import d_xb_osimlik_tajriba from "./dars/rasm/xb-osimlik-tajriba.webp";
import d_xb_chiqindi_ajratish from "./dars/rasm/xb-chiqindi-ajratish.webp";
import d_xb_yol_belgisi_tezlik from "./dars/rasm/xb-yol-belgisi-tezlik.webp";
import d_xb_kub_qurilma from "./dars/rasm/xb-kub-qurilma.webp";
import d_xb_soya_uzunligi from "./dars/rasm/xb-soya-uzunligi.webp";
import d_xb_tarozida_meva from "./dars/rasm/xb-tarozida-meva.webp";
import d_xb_chipta_navbat from "./dars/rasm/xb-chipta-navbat.webp";
import d_xb_sport_natija from "./dars/rasm/xb-sport-natija.webp";
import d_xb_aholi_diagramma from "./dars/rasm/xb-aholi-diagramma.webp";
import d_xb_tejash_choynak from "./dars/rasm/xb-tejash-choynak.webp";
import d_xb_qor_harorat from "./dars/rasm/xb-qor-harorat.webp";
import d_xb_piramida_kub from "./dars/rasm/xb-piramida-kub.webp";
import d_xb_yoyilma_tanlash from "./dars/rasm/xb-yoyilma-tanlash.webp";
import d_xb_soat_zona from "./dars/rasm/xb-soat-zona.webp";
import d_fiz_yer_oy_quyosh from "./dars/rasm/fiz-yer-oy-quyosh.webp";
import d_m_aeroport from "./dars/rasm/m-aeroport.webp";
import d_m_aksirmoq from "./dars/rasm/m-aksirmoq.webp";
import d_m_angliya from "./dars/rasm/m-angliya.webp";
import d_m_asalli_choy from "./dars/rasm/m-asalli-choy.webp";
import d_m_attraksionlar_bogi from "./dars/rasm/m-attraksionlar-bogi.webp";
import d_m_aytib_berdi from "./dars/rasm/m-aytib-berdi.webp";
import d_m_aytib_berdi_hikoya_qildi from "./dars/rasm/m-aytib-berdi-hikoya-qildi.webp";
import d_m_baland from "./dars/rasm/m-baland.webp";
import d_m_baliq_ovlamoq from "./dars/rasm/m-baliq-ovlamoq.webp";
import d_m_begemot from "./dars/rasm/m-begemot.webp";
import d_m_bel_ogrigi from "./dars/rasm/m-bel-ogrigi.webp";
import d_m_bemor from "./dars/rasm/m-bemor.webp";
import d_m_berlin from "./dars/rasm/m-berlin.webp";
import d_m_beshinchi from "./dars/rasm/m-beshinchi.webp";
import d_m_bir_xil from "./dars/rasm/m-bir-xil.webp";
import d_m_birdan from "./dars/rasm/m-birdan.webp";
import d_m_biz_edik from "./dars/rasm/m-biz-edik.webp";
import d_m_bizning from "./dars/rasm/m-bizning.webp";
import d_m_bolmoq from "./dars/rasm/m-bolmoq.webp";
import d_m_boyinbog from "./dars/rasm/m-boyinbog.webp";
import d_m_borib_keldim_mehmon_boldim from "./dars/rasm/m-borib-keldim-mehmon-boldim.webp";
import d_m_borib_kordi from "./dars/rasm/m-borib-kordi.webp";
import d_m_bosh_ogrigi from "./dars/rasm/m-bosh-ogrigi.webp";
import d_m_boshlandi_boshladi from "./dars/rasm/m-boshlandi-boshladi.webp";
import d_m_boshqacha_farqli from "./dars/rasm/m-boshqacha-farqli.webp";
import d_m_bu_edi from "./dars/rasm/m-bu-edi.webp";
import d_m_chiganoq from "./dars/rasm/m-chiganoq.webp";
import d_m_chiqmoq_kotarilmoq from "./dars/rasm/m-chiqmoq-kotarilmoq.webp";
import d_m_chomilish_kiyimi from "./dars/rasm/m-chomilish-kiyimi.webp";
import d_m_choqqi from "./dars/rasm/m-choqqi.webp";
import d_m_chuqur from "./dars/rasm/m-chuqur.webp";
import d_m_dahshatli_juda_yomon from "./dars/rasm/m-dahshatli-juda-yomon.webp";
import d_m_dala from "./dars/rasm/m-dala.webp";
import d_m_davolamoq from "./dars/rasm/m-davolamoq.webp";
import d_m_dehqon_ayol_fermer from "./dars/rasm/m-dehqon-ayol-fermer.webp";
import d_m_dengiz from "./dars/rasm/m-dengiz.webp";
import d_m_dunyo from "./dars/rasm/m-dunyo.webp";
import d_m_edi from "./dars/rasm/m-edi.webp";
import d_m_edilar from "./dars/rasm/m-edilar.webp";
import d_m_edim_edi from "./dars/rasm/m-edim-edi.webp";
import d_m_eding from "./dars/rasm/m-eding.webp";
import d_m_egizaklar from "./dars/rasm/m-egizaklar.webp";
import d_m_ehtiyot_bol from "./dars/rasm/m-ehtiyot-bol.webp";
import d_m_ehtiyotkor from "./dars/rasm/m-ehtiyotkor.webp";
import d_m_ekdi from "./dars/rasm/m-ekdi.webp";
import d_m_ekdim from "./dars/rasm/m-ekdim.webp";
import d_m_ekmoq from "./dars/rasm/m-ekmoq.webp";
import d_m_emas_edi from "./dars/rasm/m-emas-edi.webp";
import d_m_emas_edilar from "./dars/rasm/m-emas-edilar.webp";
import d_m_eng from "./dars/rasm/m-eng.webp";
import d_m_eng_kam from "./dars/rasm/m-eng-kam.webp";
import d_m_eng_katta from "./dars/rasm/m-eng-katta.webp";
import d_m_eng_kichik from "./dars/rasm/m-eng-kichik.webp";
import d_m_eshak from "./dars/rasm/m-eshak.webp";
import d_m_eshitdi_tingladi from "./dars/rasm/m-eshitdi-tingladi.webp";
import d_m_eslamoq from "./dars/rasm/m-eslamoq.webp";
import d_m_film from "./dars/rasm/m-film.webp";
import d_m_fransuz from "./dars/rasm/m-fransuz.webp";
import d_m_gap_muammo from "./dars/rasm/m-gap-muammo.webp";
import d_m_gaplashdi from "./dars/rasm/m-gaplashdi.webp";
import d_m_gaplashdim from "./dars/rasm/m-gaplashdim.webp";
import d_m_gazli_ichimlik from "./dars/rasm/m-gazli-ichimlik.webp";
import d_m_gepard from "./dars/rasm/m-gepard.webp";
import d_m_hafsalasi_pir_bolgan from "./dars/rasm/m-hafsalasi-pir-bolgan.webp";
import d_m_har_xil from "./dars/rasm/m-har-xil.webp";
import d_m_har_xil_boshqa from "./dars/rasm/m-har-xil-boshqa.webp";
import d_m_har_xil_boshqacha from "./dars/rasm/m-har-xil-boshqacha.webp";
import d_m_harorat_isitma from "./dars/rasm/m-harorat-isitma.webp";
import d_m_hayajonlangan from "./dars/rasm/m-hayajonlangan.webp";
import d_m_hayajonli_asabiy from "./dars/rasm/m-hayajonli-asabiy.webp";
import d_m_hol from "./dars/rasm/m-hol.webp";
import d_m_ichdim from "./dars/rasm/m-ichdim.webp";
import d_m_ikkalasi_ham from "./dars/rasm/m-ikkalasi-ham.webp";
import d_m_ikki_kun_oldin from "./dars/rasm/m-ikki-kun-oldin.webp";
import d_m_ingliz from "./dars/rasm/m-ingliz.webp";
import d_m_ingliz_tili from "./dars/rasm/m-ingliz-tili.webp";
import d_m_ish from "./dars/rasm/m-ish.webp";
import d_m_ishchi from "./dars/rasm/m-ishchi.webp";
import d_m_isitma from "./dars/rasm/m-isitma.webp";
import d_m_isitma_harorat from "./dars/rasm/m-isitma-harorat.webp";
import d_m_jismoniy_mashq from "./dars/rasm/m-jismoniy-mashq.webp";
import d_m_kamar from "./dars/rasm/m-kamar.webp";
import d_m_karkidon from "./dars/rasm/m-karkidon.webp";
import d_m_kasb from "./dars/rasm/m-kasb.webp";
import d_m_kasb_ish from "./dars/rasm/m-kasb-ish.webp";
import d_m_kattaroq from "./dars/rasm/m-kattaroq.webp";
import d_m_kecha from "./dars/rasm/m-kecha.webp";
import d_m_kelmoq from "./dars/rasm/m-kelmoq.webp";
import d_m_keng from "./dars/rasm/m-keng.webp";
import d_m_kerak from "./dars/rasm/m-kerak.webp";
import d_m_kerak_emas from "./dars/rasm/m-kerak-emas.webp";
import d_m_kichikroq from "./dars/rasm/m-kichikroq.webp";
import d_m_kimniki from "./dars/rasm/m-kimniki.webp";
import d_m_kimning from "./dars/rasm/m-kimning.webp";
import d_m_koproq_roq from "./dars/rasm/m-koproq-roq.webp";
import d_m_kotarib_bordi from "./dars/rasm/m-kotarib-bordi.webp";
import d_m_kruassan from "./dars/rasm/m-kruassan.webp";
import d_m_madrid from "./dars/rasm/m-madrid.webp";
import d_m_maktabda from "./dars/rasm/m-maktabda.webp";
import d_m_manzara from "./dars/rasm/m-manzara.webp";
import d_m_marra from "./dars/rasm/m-marra.webp";
import d_m_mehmon_boldi_borib_kordi from "./dars/rasm/m-mehmon-boldi-borib-kordi.webp";
import d_m_men_edim from "./dars/rasm/m-men-edim.webp";
import d_m_meniki from "./dars/rasm/m-meniki.webp";
import d_m_mevali_bog from "./dars/rasm/m-mevali-bog.webp";
import d_m_millat from "./dars/rasm/m-millat.webp";
import d_m_minora from "./dars/rasm/m-minora.webp";
import d_m_moskva from "./dars/rasm/m-moskva.webp";
import d_m_muhandis from "./dars/rasm/m-muhandis.webp";
import d_m_mumkin_emas from "./dars/rasm/m-mumkin-emas.webp";
import d_m_nemis from "./dars/rasm/m-nemis.webp";
import d_m_nimcha_jilet from "./dars/rasm/m-nimcha-jilet.webp";
import d_m_otgan_hafta from "./dars/rasm/m-otgan-hafta.webp";
import d_m_otgan_haftada from "./dars/rasm/m-otgan-haftada.webp";
import d_m_otgan_yil from "./dars/rasm/m-otgan-yil.webp";
import d_m_otgan_yili from "./dars/rasm/m-otgan-yili.webp";
import d_m_otloq from "./dars/rasm/m-otloq.webp";
import d_m_ozbek from "./dars/rasm/m-ozbek.webp";
import d_m_ozbek_tili from "./dars/rasm/m-ozbek-tili.webp";
import d_m_ozbek_ozbek_tili from "./dars/rasm/m-ozbek-ozbek-tili.webp";
import d_m_ozbekcha from "./dars/rasm/m-ozbekcha.webp";
import d_m_ochdim from "./dars/rasm/m-ochdim.webp";
import d_m_ochiq from "./dars/rasm/m-ochiq.webp";
import d_m_ogir from "./dars/rasm/m-ogir.webp";
import d_m_ogrimoq from "./dars/rasm/m-ogrimoq.webp";
import d_m_orol from "./dars/rasm/m-orol.webp";
import d_m_orqa from "./dars/rasm/m-orqa.webp";
import d_m_orqa_bel from "./dars/rasm/m-orqa-bel.webp";
import d_m_oshpaz from "./dars/rasm/m-oshpaz.webp";
import d_m_oshqozon_qorin from "./dars/rasm/m-oshqozon-qorin.webp";
import d_m_oson from "./dars/rasm/m-oson.webp";
import d_m_parij from "./dars/rasm/m-parij.webp";
import d_m_pishirdim from "./dars/rasm/m-pishirdim.webp";
import d_m_piyoda_yurdi_sayr_qildi from "./dars/rasm/m-piyoda-yurdi-sayr-qildi.webp";
import d_m_piyoda_yurdim_sayr_qildim from "./dars/rasm/m-piyoda-yurdim-sayr-qildim.webp";
import d_m_plastir from "./dars/rasm/m-plastir.webp";
import d_m_politsiyachi from "./dars/rasm/m-politsiyachi.webp";
import d_m_poyga from "./dars/rasm/m-poyga.webp";
import d_m_qildi from "./dars/rasm/m-qildi.webp";
import d_m_qiyin from "./dars/rasm/m-qiyin.webp";
import d_m_qoldi from "./dars/rasm/m-qoldi.webp";
import d_m_qoldim from "./dars/rasm/m-qoldim.webp";
import d_m_qorin from "./dars/rasm/m-qorin.webp";
import d_m_qorin_ogrigi from "./dars/rasm/m-qorin-ogrigi.webp";
import d_m_qozogiston from "./dars/rasm/m-qozogiston.webp";
import d_m_qozoq from "./dars/rasm/m-qozoq.webp";
import d_m_qozoq_qozoq_tili from "./dars/rasm/m-qozoq-qozoq-tili.webp";
import d_m_qurmoq from "./dars/rasm/m-qurmoq.webp";
import d_m_quruq from "./dars/rasm/m-quruq.webp";
import d_m_quyon from "./dars/rasm/m-quyon.webp";
import d_m_rossiya from "./dars/rasm/m-rossiya.webp";
import d_m_rus_tili from "./dars/rasm/m-rus-tili.webp";
import d_m_salqin from "./dars/rasm/m-salqin.webp";
import d_m_sandal from "./dars/rasm/m-sandal.webp";
import d_m_sen_eding from "./dars/rasm/m-sen-eding.webp";
import d_m_sen_qilmasliging_kerak from "./dars/rasm/m-sen-qilmasliging-kerak.webp";
import d_m_seniki from "./dars/rasm/m-seniki.webp";
import d_m_shamollash from "./dars/rasm/m-shamollash.webp";
import d_m_shamollash_tumov from "./dars/rasm/m-shamollash-tumov.webp";
import d_m_sharshara from "./dars/rasm/m-sharshara.webp";
import d_m_shifokor from "./dars/rasm/m-shifokor.webp";
import d_m_shimol from "./dars/rasm/m-shimol.webp";
import d_m_shovqinli from "./dars/rasm/m-shovqinli.webp";
import d_m_sizlar_edingiz from "./dars/rasm/m-sizlar-edingiz.webp";
import d_m_sizlarning from "./dars/rasm/m-sizlarning.webp";
import d_m_sizning from "./dars/rasm/m-sizning.webp";
import d_m_sotib_oldi from "./dars/rasm/m-sotib-oldi.webp";
import d_m_sovun_pufagi from "./dars/rasm/m-sovun-pufagi.webp";
import d_m_sugordi from "./dars/rasm/m-sugordi.webp";
import d_m_sugordim from "./dars/rasm/m-sugordim.webp";
import d_m_suv_idishi from "./dars/rasm/m-suv-idishi.webp";
import d_m_sviter from "./dars/rasm/m-sviter.webp";
import d_m_taroq from "./dars/rasm/m-taroq.webp";
import d_m_terdi from "./dars/rasm/m-terdi.webp";
import d_m_terdim_yigdim from "./dars/rasm/m-terdim-yigdim.webp";
import d_m_tingladi from "./dars/rasm/m-tingladi.webp";
import d_m_tingladim from "./dars/rasm/m-tingladim.webp";
import d_m_tish_ogrigi from "./dars/rasm/m-tish-ogrigi.webp";
import d_m_tish_pastasi from "./dars/rasm/m-tish-pastasi.webp";
import d_m_tish_shifokori from "./dars/rasm/m-tish-shifokori.webp";
import d_m_tola from "./dars/rasm/m-tola.webp";
import d_m_tolqin from "./dars/rasm/m-tolqin.webp";
import d_m_toxtadi from "./dars/rasm/m-toxtadi.webp";
import d_m_toglar_tizmasi from "./dars/rasm/m-toglar-tizmasi.webp";
import d_m_tomoq from "./dars/rasm/m-tomoq.webp";
import d_m_tomoq_ogrigi from "./dars/rasm/m-tomoq-ogrigi.webp";
import d_m_topdi from "./dars/rasm/m-topdi.webp";
import d_m_topdim from "./dars/rasm/m-topdim.webp";
import d_m_tozaladi from "./dars/rasm/m-tozaladi.webp";
import d_m_tozaladim from "./dars/rasm/m-tozaladim.webp";
import d_m_tugatdi from "./dars/rasm/m-tugatdi.webp";
import d_m_tugatdim from "./dars/rasm/m-tugatdim.webp";
import d_m_tumanli from "./dars/rasm/m-tumanli.webp";
import d_m_tushlik_qutisi from "./dars/rasm/m-tushlik-qutisi.webp";
import d_m_uchuvchi from "./dars/rasm/m-uchuvchi.webp";
import d_m_ularniki from "./dars/rasm/m-ularniki.webp";
import d_m_ularning from "./dars/rasm/m-ularning.webp";
import d_m_uniki_ularniki from "./dars/rasm/m-uniki-ularniki.webp";
import d_m_uning from "./dars/rasm/m-uning.webp";
import d_m_unutdi from "./dars/rasm/m-unutdi.webp";
import d_m_unutdim from "./dars/rasm/m-unutdim.webp";
import d_m_veterinar from "./dars/rasm/m-veterinar.webp";
import d_m_vodiy from "./dars/rasm/m-vodiy.webp";
import d_m_xalat from "./dars/rasm/m-xalat.webp";
import d_m_xavfli from "./dars/rasm/m-xavfli.webp";
import d_m_xavotirda from "./dars/rasm/m-xavotirda.webp";
import d_m_xavotirli from "./dars/rasm/m-xavotirli.webp";
import d_m_xitoy from "./dars/rasm/m-xitoy.webp";
import d_m_xitoy_tili from "./dars/rasm/m-xitoy-tili.webp";
import d_m_xitoy_xitoy_tili from "./dars/rasm/m-xitoy-xitoy-tili.webp";
import d_m_xitoycha_xitoy from "./dars/rasm/m-xitoycha-xitoy.webp";
import d_m_xuddi_kabi from "./dars/rasm/m-xuddi-kabi.webp";
import d_m_yangilik from "./dars/rasm/m-yangilik.webp";
import d_m_yapon from "./dars/rasm/m-yapon.webp";
import d_m_yapon_tili from "./dars/rasm/m-yapon-tili.webp";
import d_m_yapon_yapon_tili from "./dars/rasm/m-yapon-yapon-tili.webp";
import d_m_yaponiya from "./dars/rasm/m-yaponiya.webp";
import d_m_yaxshiroq from "./dars/rasm/m-yaxshiroq.webp";
import d_m_yengil from "./dars/rasm/m-yengil.webp";
import d_m_yetib_keldim from "./dars/rasm/m-yetib-keldim.webp";
import d_m_yetishtirmoq from "./dars/rasm/m-yetishtirmoq.webp";
import d_m_yetishtirmoq_ostirmoq from "./dars/rasm/m-yetishtirmoq-ostirmoq.webp";
import d_m_yigishtirdi from "./dars/rasm/m-yigishtirdi.webp";
import d_m_yiqildim from "./dars/rasm/m-yiqildim.webp";
import d_m_yiqilmoq from "./dars/rasm/m-yiqilmoq.webp";
import d_m_yotal from "./dars/rasm/m-yotal.webp";
import d_m_yotalmoq from "./dars/rasm/m-yotalmoq.webp";
import d_m_yolgiz from "./dars/rasm/m-yolgiz.webp";
import d_m_yomonroq from "./dars/rasm/m-yomonroq.webp";
import d_m_yomonroq_eng_yomon from "./dars/rasm/m-yomonroq-eng-yomon.webp";
import d_m_yopiq from "./dars/rasm/m-yopiq.webp";
import d_m_yordam_berdi from "./dars/rasm/m-yordam-berdi.webp";
import d_m_yordam_berdim from "./dars/rasm/m-yordam-berdim.webp";
import d_m_yosh from "./dars/rasm/m-yosh.webp";
import d_m_yoshi_katta from "./dars/rasm/m-yoshi-katta.webp";
import d_m_yoshi_kattaroq from "./dars/rasm/m-yoshi-kattaroq.webp";
import d_m_yovvoyi from "./dars/rasm/m-yovvoyi.webp";
import d_m_yozdi from "./dars/rasm/m-yozdi.webp";
import d_m_yozdim from "./dars/rasm/m-yozdim.webp";
import d_m_yozishma_dost from "./dars/rasm/m-yozishma-dost.webp";
import d_m_yozishma_dosti from "./dars/rasm/m-yozishma-dosti.webp";
import d_m_yozuvchi from "./dars/rasm/m-yozuvchi.webp";
import d_m_yuvdi from "./dars/rasm/m-yuvdi.webp";
import d_m_zaif_kuchsiz from "./dars/rasm/m-zaif-kuchsiz.webp";
import d_m_zararli from "./dars/rasm/m-zararli.webp";
import d_m_zararli_nosoglom from "./dars/rasm/m-zararli-nosoglom.webp";
import d_m_bolmoqchiman from "./dars/rasm/m-bolmoqchiman.webp";
import d_m_dan_kamroq from "./dars/rasm/m-dan-kamroq.webp";
import d_m_dan_koproq from "./dars/rasm/m-dan-koproq.webp";
import d_m_dek_kabi from "./dars/rasm/m-dek-kabi.webp";
import d_m_ham_emas from "./dars/rasm/m-ham-emas.webp";
import d_m_qilishing_kerak from "./dars/rasm/m-qilishing-kerak.webp";
import d_m_qilmasliging_kerak from "./dars/rasm/m-qilmasliging-kerak.webp";
import d_m_dan_2 from "./dars/rasm/m-dan-2.webp";
import d_m_dan_kelmoq from "./dars/rasm/m-dan-kelmoq.webp";
import d_m_urdi from "./dars/rasm/m-urdi.webp";
import d_m_qatnamoq_borib_kelmoq from "./dars/rasm/m-qatnamoq-borib-kelmoq.webp";
import d_m_adi from "./dars/rasm/m-adi.webp";
import d_m_dimi from "./dars/rasm/m-dimi.webp";
import d_m_madi from "./dars/rasm/m-madi.webp";
import d_m_maydi from "./dars/rasm/m-maydi.webp";
import d_m_moqchi from "./dars/rasm/m-moqchi.webp";
import d_m_dan_keyin from "./dars/rasm/m-dan-keyin.webp";
import d_m_moqchi_bolmoq_rejalashtirmoq from "./dars/rasm/m-moqchi-bolmoq-rejalashtirmoq.webp";
import d_m_achchiq_otkir from "./dars/rasm/m-achchiq-otkir.webp";
import d_m_akrobat_dorboz from "./dars/rasm/m-akrobat-dorboz.webp";
import d_m_aktrisa from "./dars/rasm/m-aktrisa.webp";
import d_m_aktyor from "./dars/rasm/m-aktyor.webp";
import d_m_amin_ishonchim_komil from "./dars/rasm/m-amin-ishonchim-komil.webp";
import d_m_aytdi from "./dars/rasm/m-aytdi.webp";
import d_m_aytdi_aytib_berdi from "./dars/rasm/m-aytdi-aytib-berdi.webp";
import d_m_aytdim from "./dars/rasm/m-aytdim.webp";
import d_m_aytmoq from "./dars/rasm/m-aytmoq.webp";
import d_m_bahona from "./dars/rasm/m-bahona.webp";
import d_m_balandlik from "./dars/rasm/m-balandlik.webp";
import d_m_balki from "./dars/rasm/m-balki.webp";
import d_m_banka from "./dars/rasm/m-banka.webp";
import d_m_baqlajon from "./dars/rasm/m-baqlajon.webp";
import d_m_berdi from "./dars/rasm/m-berdi.webp";
import d_m_bilaguzuk from "./dars/rasm/m-bilaguzuk.webp";
import d_m_biror_narsa from "./dars/rasm/m-biror-narsa.webp";
import d_m_biroz_bir_nechta from "./dars/rasm/m-biroz-bir-nechta.webp";
import d_m_biroz_ozgina from "./dars/rasm/m-biroz-ozgina.webp";
import d_m_boldi_yuz_berdi from "./dars/rasm/m-boldi-yuz-berdi.webp";
import d_m_boldim from "./dars/rasm/m-boldim.webp";
import d_m_boron_momaqaldiroqli_yomgir from "./dars/rasm/m-boron-momaqaldiroqli-yomgir.webp";
import d_m_bojxona from "./dars/rasm/m-bojxona.webp";
import d_m_bor_edi_otkazdi from "./dars/rasm/m-bor-edi-otkazdi.webp";
import d_m_bordi from "./dars/rasm/m-bordi.webp";
import d_m_bordim from "./dars/rasm/m-bordim.webp";
import d_m_boshlanish from "./dars/rasm/m-boshlanish.webp";
import d_m_boy from "./dars/rasm/m-boy.webp";
import d_m_bulochka from "./dars/rasm/m-bulochka.webp";
import d_m_chalmoq from "./dars/rasm/m-chalmoq.webp";
import d_m_chamadon from "./dars/rasm/m-chamadon.webp";
import d_m_chaqmoq from "./dars/rasm/m-chaqmoq.webp";
import d_m_charchatadigan from "./dars/rasm/m-charchatadigan.webp";
import d_m_chet_el_xorijiy from "./dars/rasm/m-chet-el-xorijiy.webp";
import d_m_chet_elda from "./dars/rasm/m-chet-elda.webp";
import d_m_chet_elda_chet_elga from "./dars/rasm/m-chet-elda-chet-elga.webp";
import d_m_chodir_tikib_dam_olmoq from "./dars/rasm/m-chodir-tikib-dam-olmoq.webp";
import d_m_cholgu_asbobi from "./dars/rasm/m-cholgu-asbobi.webp";
import d_m_daraja from "./dars/rasm/m-daraja.webp";
import d_m_daryo from "./dars/rasm/m-daryo.webp";
import d_m_davom_etmoq from "./dars/rasm/m-davom-etmoq.webp";
import d_m_dedi from "./dars/rasm/m-dedi.webp";
import d_m_diqqatga_sazovor_joy from "./dars/rasm/m-diqqatga-sazovor-joy.webp";
import d_m_durang from "./dars/rasm/m-durang.webp";
import d_m_ehtimol from "./dars/rasm/m-ehtimol.webp";
import d_m_ehtimol_katta_ehtimol_bilan from "./dars/rasm/m-ehtimol-katta-ehtimol-bilan.webp";
import d_m_ehtiyot_bolmoq from "./dars/rasm/m-ehtiyot-bolmoq.webp";
import d_m_ekran from "./dars/rasm/m-ekran.webp";
import d_m_ekskursiya_tashrif from "./dars/rasm/m-ekskursiya-tashrif.webp";
import d_m_eng_baland from "./dars/rasm/m-eng-baland.webp";
import d_m_eng_chiroyli from "./dars/rasm/m-eng-chiroyli.webp";
import d_m_eng_gozal from "./dars/rasm/m-eng-gozal.webp";
import d_m_eng_kop_yoqtirib from "./dars/rasm/m-eng-kop-yoqtirib.webp";
import d_m_eng_ogir from "./dars/rasm/m-eng-ogir.webp";
import d_m_eng_tez from "./dars/rasm/m-eng-tez.webp";
import d_m_eng_uzun from "./dars/rasm/m-eng-uzun.webp";
import d_m_eng_yomon from "./dars/rasm/m-eng-yomon.webp";
import d_m_eng_yosh from "./dars/rasm/m-eng-yosh.webp";
import d_m_esdalik_sovga_suvenir from "./dars/rasm/m-esdalik-sovga-suvenir.webp";
import d_m_esdalik_sovgasi from "./dars/rasm/m-esdalik-sovgasi.webp";
import d_m_eslamoq_yodga_olmoq from "./dars/rasm/m-eslamoq-yodga-olmoq.webp";
import d_m_fonar from "./dars/rasm/m-fonar.webp";
import d_m_gramm from "./dars/rasm/m-gramm.webp";
import d_m_gulxan from "./dars/rasm/m-gulxan.webp";
import d_m_gumbaz from "./dars/rasm/m-gumbaz.webp";
import d_m_haddan_tashqari_kop from "./dars/rasm/m-haddan-tashqari-kop.webp";
import d_m_hakam from "./dars/rasm/m-hakam.webp";
import d_m_hamma from "./dars/rasm/m-hamma.webp";
import d_m_hamma_joyda from "./dars/rasm/m-hamma-joyda.webp";
import d_m_haqiqat_rost from "./dars/rasm/m-haqiqat-rost.webp";
import d_m_haykal from "./dars/rasm/m-haykal.webp";
import d_m_haykal_yodgorlik from "./dars/rasm/m-haykal-yodgorlik.webp";
import d_m_hayot from "./dars/rasm/m-hayot.webp";
import d_m_hech_narsa from "./dars/rasm/m-hech-narsa.webp";
import d_m_hech_qancha_biror from "./dars/rasm/m-hech-qancha-biror.webp";
import d_m_hordiq_chiqarmoq from "./dars/rasm/m-hordiq-chiqarmoq.webp";
import d_m_hujumchi from "./dars/rasm/m-hujumchi.webp";
import d_m_indinga from "./dars/rasm/m-indinga.webp";
import d_m_ishonchi_komil from "./dars/rasm/m-ishonchi-komil.webp";
import d_m_ishonchli_aniq from "./dars/rasm/m-ishonchli-aniq.webp";
import d_m_javob_bermoq from "./dars/rasm/m-javob-bermoq.webp";
import d_m_jiyan from "./dars/rasm/m-jiyan.webp";
import d_m_jonab_ketmoq from "./dars/rasm/m-jonab-ketmoq.webp";
import d_m_jonamoq_ketmoq from "./dars/rasm/m-jonamoq-ketmoq.webp";
import d_m_joy_orin from "./dars/rasm/m-joy-orin.webp";
import d_m_kam_oz from "./dars/rasm/m-kam-oz.webp";
import d_m_kassa from "./dars/rasm/m-kassa.webp";
import d_m_kechikish from "./dars/rasm/m-kechikish.webp";
import d_m_kelajak from "./dars/rasm/m-kelajak.webp";
import d_m_kelasi_hafta from "./dars/rasm/m-kelasi-hafta.webp";
import d_m_kelasi_haftada from "./dars/rasm/m-kelasi-haftada.webp";
import d_m_kelin from "./dars/rasm/m-kelin.webp";
import d_m_kesmoq_togramoq from "./dars/rasm/m-kesmoq-togramoq.webp";
import d_m_ketdi_jonadi from "./dars/rasm/m-ketdi-jonadi.webp";
import d_m_keyingi_hafta from "./dars/rasm/m-keyingi-hafta.webp";
import d_m_kim from "./dars/rasm/m-kim.webp";
import d_m_klaviatura from "./dars/rasm/m-klaviatura.webp";
import d_m_korgazma from "./dars/rasm/m-korgazma.webp";
import d_m_kotarib_bormoq from "./dars/rasm/m-kotarib-bormoq.webp";
import d_m_kotarilmoq from "./dars/rasm/m-kotarilmoq.webp";
import d_m_kozboyloqchi_fokuschi from "./dars/rasm/m-kozboyloqchi-fokuschi.webp";
import d_m_kozdan_kechirmoq from "./dars/rasm/m-kozdan-kechirmoq.webp";
import d_m_koala from "./dars/rasm/m-koala.webp";
import d_m_koinot from "./dars/rasm/m-koinot.webp";
import d_m_koinot_kosmos from "./dars/rasm/m-koinot-kosmos.webp";
import d_m_koshin_sirli_gisht from "./dars/rasm/m-koshin-sirli-gisht.webp";
import d_m_kosmonavt from "./dars/rasm/m-kosmonavt.webp";
import d_m_krep from "./dars/rasm/m-krep.webp";
import d_m_kuldi from "./dars/rasm/m-kuldi.webp";
import d_m_kuy from "./dars/rasm/m-kuy.webp";
import d_m_kuy_ohang from "./dars/rasm/m-kuy-ohang.webp";
import d_m_kuyov from "./dars/rasm/m-kuyov.webp";
import d_m_lift from "./dars/rasm/m-lift.webp";
import d_m_litr from "./dars/rasm/m-litr.webp";
import d_m_makkajoxori from "./dars/rasm/m-makkajoxori.webp";
import d_m_manti from "./dars/rasm/m-manti.webp";
import d_m_manzara_korinish from "./dars/rasm/m-manzara-korinish.webp";
import d_m_maqbara from "./dars/rasm/m-maqbara.webp";
import d_m_masxaraboz_kloun from "./dars/rasm/m-masxaraboz-kloun.webp";
import d_m_minora_baland_bino from "./dars/rasm/m-minora-baland-bino.webp";
import d_m_minora_minora_bino from "./dars/rasm/m-minora-minora-bino.webp";
import d_m_minus from "./dars/rasm/m-minus.webp";
import d_m_momaqaldiroqli_boron from "./dars/rasm/m-momaqaldiroqli-boron.webp";
import d_m_momaqaldiroqli_jala from "./dars/rasm/m-momaqaldiroqli-jala.webp";
import d_m_mototsikl from "./dars/rasm/m-mototsikl.webp";
import d_m_muxlis from "./dars/rasm/m-muxlis.webp";
import d_m_muxlis_ishqiboz from "./dars/rasm/m-muxlis-ishqiboz.webp";
import d_m_nega from "./dars/rasm/m-nega.webp";
import d_m_nega_nima_uchun from "./dars/rasm/m-nega-nima-uchun.webp";
import d_m_nevara from "./dars/rasm/m-nevara.webp";
import d_m_noxat from "./dars/rasm/m-noxat.webp";
import d_m_organmoq from "./dars/rasm/m-organmoq.webp";
import d_m_otdi_tugadi from "./dars/rasm/m-otdi-tugadi.webp";
import d_m_ozgarmoq_ozgartirmoq from "./dars/rasm/m-ozgarmoq-ozgartirmoq.webp";
import d_m_ozgartirmoq from "./dars/rasm/m-ozgartirmoq.webp";
import d_m_ob_havo_malumoti from "./dars/rasm/m-ob-havo-malumoti.webp";
import d_m_okean from "./dars/rasm/m-okean.webp";
import d_m_oldi from "./dars/rasm/m-oldi.webp";
import d_m_oldim from "./dars/rasm/m-oldim.webp";
import d_m_olib_kelmoq from "./dars/rasm/m-olib-kelmoq.webp";
import d_m_oltinchi from "./dars/rasm/m-oltinchi.webp";
import d_m_ommabop from "./dars/rasm/m-ommabop.webp";
import d_m_orzu from "./dars/rasm/m-orzu.webp";
import d_m_osma_yol from "./dars/rasm/m-osma-yol.webp";
import d_m_osmonopar_bino from "./dars/rasm/m-osmonopar-bino.webp";
import d_m_oxir_tugash from "./dars/rasm/m-oxir-tugash.webp";
import d_m_oz from "./dars/rasm/m-oz.webp";
import d_m_oz_kam from "./dars/rasm/m-oz-kam.webp";
import d_m_ozgina from "./dars/rasm/m-ozgina.webp";
import d_m_ozgina_biroz from "./dars/rasm/m-ozgina-biroz.webp";
import d_m_parvoz_reys from "./dars/rasm/m-parvoz-reys.webp";
import d_m_pasport from "./dars/rasm/m-pasport.webp";
import d_m_pinyata from "./dars/rasm/m-pinyata.webp";
import d_m_planshet from "./dars/rasm/m-planshet.webp";
import d_m_platforma from "./dars/rasm/m-platforma.webp";
import d_m_platforma_perron from "./dars/rasm/m-platforma-perron.webp";
import d_m_popkorn from "./dars/rasm/m-popkorn.webp";
import d_m_port from "./dars/rasm/m-port.webp";
import d_m_port_bandargoh from "./dars/rasm/m-port-bandargoh.webp";
import d_m_qabulxona from "./dars/rasm/m-qabulxona.webp";
import d_m_qachon from "./dars/rasm/m-qachon.webp";
import d_m_qadoq_quti from "./dars/rasm/m-qadoq-quti.webp";
import d_m_qahramon from "./dars/rasm/m-qahramon.webp";
import d_m_qarindoshlar from "./dars/rasm/m-qarindoshlar.webp";
import d_m_qarzga_bermoq from "./dars/rasm/m-qarzga-bermoq.webp";
import d_m_qatnov_jadvali from "./dars/rasm/m-qatnov-jadvali.webp";
import d_m_qayerga from "./dars/rasm/m-qayerga.webp";
import d_m_qaytarib_bermoq from "./dars/rasm/m-qaytarib-bermoq.webp";
import d_m_qaytib_orqaga from "./dars/rasm/m-qaytib-orqaga.webp";
import d_m_qildi_yasadi from "./dars/rasm/m-qildi-yasadi.webp";
import d_m_qildim_tayyorladim from "./dars/rasm/m-qildim-tayyorladim.webp";
import d_m_qizil_chiroq from "./dars/rasm/m-qizil-chiroq.webp";
import d_m_qizilgoz from "./dars/rasm/m-qizilgoz.webp";
import d_m_qol_chirogi from "./dars/rasm/m-qol-chirogi.webp";
import d_m_qongiroq_qildi from "./dars/rasm/m-qongiroq-qildi.webp";
import d_m_qonmoq from "./dars/rasm/m-qonmoq.webp";
import d_m_qoshiqchi from "./dars/rasm/m-qoshiqchi.webp";
import d_m_qoshmoq from "./dars/rasm/m-qoshmoq.webp";
import d_m_qoy_goshti from "./dars/rasm/m-qoy-goshti.webp";
import d_m_qoydim from "./dars/rasm/m-qoydim.webp";
import d_m_qochib_ketdi from "./dars/rasm/m-qochib-ketdi.webp";
import d_m_qumdan_qasr from "./dars/rasm/m-qumdan-qasr.webp";
import d_m_quti_pachka from "./dars/rasm/m-quti-pachka.webp";
import d_m_quyoshdan_himoya_kremi from "./dars/rasm/m-quyoshdan-himoya-kremi.webp";
import d_m_quyoshdan_saqlovchi_krem from "./dars/rasm/m-quyoshdan-saqlovchi-krem.webp";
import d_m_reja from "./dars/rasm/m-reja.webp";
import d_m_rekord from "./dars/rasm/m-rekord.webp";
import d_m_retsept from "./dars/rasm/m-retsept.webp";
import d_m_reys from "./dars/rasm/m-reys.webp";
import d_m_reys_parvoz from "./dars/rasm/m-reys-parvoz.webp";
import d_m_saroy from "./dars/rasm/m-saroy.webp";
import d_m_sayohat_qilib_joylarni_kormoq from "./dars/rasm/m-sayohat-qilib-joylarni-kormoq.webp";
import d_m_sayohat_qilmoq from "./dars/rasm/m-sayohat-qilmoq.webp";
import d_m_sayohat_safar from "./dars/rasm/m-sayohat-safar.webp";
import d_m_selfi from "./dars/rasm/m-selfi.webp";
import d_m_sevimli_ommabop from "./dars/rasm/m-sevimli-ommabop.webp";
import d_m_shahar_korish_sayr_qilish from "./dars/rasm/m-shahar-korish-sayr-qilish.webp";
import d_m_shampun from "./dars/rasm/m-shampun.webp";
import d_m_shashlik from "./dars/rasm/m-shashlik.webp";
import d_m_shirinlik from "./dars/rasm/m-shirinlik.webp";
import d_m_shor from "./dars/rasm/m-shor.webp";
import d_m_shox from "./dars/rasm/m-shox.webp";
import d_m_sindirdi from "./dars/rasm/m-sindirdi.webp";
import d_m_sindirmoq from "./dars/rasm/m-sindirmoq.webp";
import d_m_singan_buzilgan from "./dars/rasm/m-singan-buzilgan.webp";
import d_m_sirli_maxfiy from "./dars/rasm/m-sirli-maxfiy.webp";
import d_m_skripka from "./dars/rasm/m-skripka.webp";
import d_m_soqmoq_yolak from "./dars/rasm/m-soqmoq-yolak.webp";
import d_m_soradi from "./dars/rasm/m-soradi.webp";
import d_m_soch_chotkasi from "./dars/rasm/m-soch-chotkasi.webp";
import d_m_sovga_qildi from "./dars/rasm/m-sovga-qildi.webp";
import d_m_sovrin from "./dars/rasm/m-sovrin.webp";
import d_m_sovrin_mukofot from "./dars/rasm/m-sovrin-mukofot.webp";
import d_m_soyabon from "./dars/rasm/m-soyabon.webp";
import d_m_sportchi from "./dars/rasm/m-sportchi.webp";
import d_m_suli_botqasi from "./dars/rasm/m-suli-botqasi.webp";
import d_m_suzuvchi_toshak from "./dars/rasm/m-suzuvchi-toshak.webp";
import d_m_tam from "./dars/rasm/m-tam.webp";
import d_m_tanlov from "./dars/rasm/m-tanlov.webp";
import d_m_taom from "./dars/rasm/m-taom.webp";
import d_m_tartib from "./dars/rasm/m-tartib.webp";
import d_m_tartibli_yigishtirilgan from "./dars/rasm/m-tartibli-yigishtirilgan.webp";
import d_m_tatib_kormoq from "./dars/rasm/m-tatib-kormoq.webp";
import d_m_taxmin_qilmoq from "./dars/rasm/m-taxmin-qilmoq.webp";
import d_m_taxtakach from "./dars/rasm/m-taxtakach.webp";
import d_m_termos from "./dars/rasm/m-termos.webp";
import d_m_tez_orada from "./dars/rasm/m-tez-orada.webp";
import d_m_tez_orada_yaqinda from "./dars/rasm/m-tez-orada-yaqinda.webp";
import d_m_tezlik from "./dars/rasm/m-tezlik.webp";
import d_m_togri from "./dars/rasm/m-togri.webp";
import d_m_toy from "./dars/rasm/m-toy.webp";
import d_m_topmoq_bashorat_qilmoq from "./dars/rasm/m-topmoq-bashorat-qilmoq.webp";
import d_m_tovus from "./dars/rasm/m-tovus.webp";
import d_m_tramvay from "./dars/rasm/m-tramvay.webp";
import d_m_tugadi from "./dars/rasm/m-tugadi.webp";
import d_m_tugma from "./dars/rasm/m-tugma.webp";
import d_m_tuxum_qovurma_quymoq from "./dars/rasm/m-tuxum-qovurma-quymoq.webp";
import d_m_uchib_kotarilmoq from "./dars/rasm/m-uchib-kotarilmoq.webp";
import d_m_un from "./dars/rasm/m-un.webp";
import d_m_unutilmas from "./dars/rasm/m-unutilmas.webp";
import d_m_unutmoq from "./dars/rasm/m-unutmoq.webp";
import d_m_urmoq from "./dars/rasm/m-urmoq.webp";
import d_m_uxlab_qolmoq from "./dars/rasm/m-uxlab-qolmoq.webp";
import d_m_uxladi from "./dars/rasm/m-uxladi.webp";
import d_m_uxlash_xaltasi from "./dars/rasm/m-uxlash-xaltasi.webp";
import d_m_uygondi from "./dars/rasm/m-uygondi.webp";
import d_m_vada_bermoq from "./dars/rasm/m-vada-bermoq.webp";
import d_m_vagon from "./dars/rasm/m-vagon.webp";
import d_m_viza from "./dars/rasm/m-viza.webp";
import d_m_vulqon from "./dars/rasm/m-vulqon.webp";
import d_m_xavotirlandi from "./dars/rasm/m-xavotirlandi.webp";
import d_m_xavotirli_tashvishli from "./dars/rasm/m-xavotirli-tashvishli.webp";
import d_m_xotira_esdalik from "./dars/rasm/m-xotira-esdalik.webp";
import d_m_yasadi_tayyorladi from "./dars/rasm/m-yasadi-tayyorladi.webp";
import d_m_yashirincha from "./dars/rasm/m-yashirincha.webp";
import d_m_yaxshiyamki from "./dars/rasm/m-yaxshiyamki.webp";
import d_m_yeb_qoydi from "./dars/rasm/m-yeb-qoydi.webp";
import d_m_yer from "./dars/rasm/m-yer.webp";
import d_m_yetarli from "./dars/rasm/m-yetarli.webp";
import d_m_yetib_keladi from "./dars/rasm/m-yetib-keladi.webp";
import d_m_yetib_keldi from "./dars/rasm/m-yetib-keldi.webp";
import d_m_yetib_kelish from "./dars/rasm/m-yetib-kelish.webp";
import d_m_yigmoq_joylamoq from "./dars/rasm/m-yigmoq-joylamoq.webp";
import d_m_yiqildi from "./dars/rasm/m-yiqildi.webp";
import d_m_yol from "./dars/rasm/m-yol.webp";
import d_m_yodgorlik from "./dars/rasm/m-yodgorlik.webp";
import d_m_yoqilgi_quyish_shoxobchasi from "./dars/rasm/m-yoqilgi-quyish-shoxobchasi.webp";
import d_m_yubormoq from "./dars/rasm/m-yubormoq.webp";
import d_m_yugurdi from "./dars/rasm/m-yugurdi.webp";
import d_m_yutdi from "./dars/rasm/m-yutdi.webp";
import d_m_yutqazdi from "./dars/rasm/m-yutqazdi.webp";
import d_m_zira from "./dars/rasm/m-zira.webp";
import d_m_ziravorlar from "./dars/rasm/m-ziravorlar.webp";
import d_m_kundalik from "./dars/rasm/m-kundalik.webp";
import d_m_almashinuvi from "./dars/rasm/m-almashinuvi.webp";
import d_m_ayotganda_gan_paytda from "./dars/rasm/m-ayotganda-gan-paytda.webp";
import d_m_azo from "./dars/rasm/m-azo.webp";
import d_m_achchiq from "./dars/rasm/m-achchiq.webp";
import d_m_achchiq_ziravorli from "./dars/rasm/m-achchiq-ziravorli.webp";
import d_m_afzal_kormoq from "./dars/rasm/m-afzal-kormoq.webp";
import d_m_afzalroq_koproq_yoqadi from "./dars/rasm/m-afzalroq-koproq-yoqadi.webp";
import d_m_ajratmoq from "./dars/rasm/m-ajratmoq.webp";
import d_m_aksiya_tadbir from "./dars/rasm/m-aksiya-tadbir.webp";
import d_m_aldamoq_kochirmoq from "./dars/rasm/m-aldamoq-kochirmoq.webp";
import d_m_algebra from "./dars/rasm/m-algebra.webp";
import d_m_allaqachon from "./dars/rasm/m-allaqachon.webp";
import d_m_allaqachon_endi from "./dars/rasm/m-allaqachon-endi.webp";
import d_m_allaqachon_hech from "./dars/rasm/m-allaqachon-hech.webp";
import d_m_amerika_tepaligi from "./dars/rasm/m-amerika-tepaligi.webp";
import d_m_anglatmoq_manosi_bolmoq from "./dars/rasm/m-anglatmoq-manosi-bolmoq.webp";
import d_m_asar from "./dars/rasm/m-asar.webp";
import d_m_asr from "./dars/rasm/m-asr.webp";
import d_m_asramoq from "./dars/rasm/m-asramoq.webp";
import d_m_astronom_munajjim from "./dars/rasm/m-astronom-munajjim.webp";
import d_m_atrof_muhit from "./dars/rasm/m-atrof-muhit.webp";
import d_m_axlat from "./dars/rasm/m-axlat.webp";
import d_m_axlat_chelagi from "./dars/rasm/m-axlat-chelagi.webp";
import d_m_axlat_konteyneri from "./dars/rasm/m-axlat-konteyneri.webp";
import d_m_axlat_chiqindi from "./dars/rasm/m-axlat-chiqindi.webp";
import d_m_aynan_shu_paytda from "./dars/rasm/m-aynan-shu-paytda.webp";
import d_m_baho from "./dars/rasm/m-baho.webp";
import d_m_baliqchi from "./dars/rasm/m-baliqchi.webp";
import d_m_begona_odam from "./dars/rasm/m-begona-odam.webp";
import d_m_begona_odam_notanish from "./dars/rasm/m-begona-odam-notanish.webp";
import d_m_belgi_lavha from "./dars/rasm/m-belgi-lavha.webp";
import d_m_belgi_yozuv from "./dars/rasm/m-belgi-yozuv.webp";
import d_m_belgi_yozuvli_taxta from "./dars/rasm/m-belgi-yozuvli-taxta.webp";
import d_m_bergan from "./dars/rasm/m-bergan.webp";
import d_m_bezak from "./dars/rasm/m-bezak.webp";
import d_m_bilim from "./dars/rasm/m-bilim.webp";
import d_m_bint from "./dars/rasm/m-bint.webp";
import d_m_bir_marta from "./dars/rasm/m-bir-marta.webp";
import d_m_bir_marta_ham from "./dars/rasm/m-bir-marta-ham.webp";
import d_m_bir_necha_marta from "./dars/rasm/m-bir-necha-marta.webp";
import d_m_birdan_tosatdan from "./dars/rasm/m-birdan-tosatdan.webp";
import d_m_birinchi_marta from "./dars/rasm/m-birinchi-marta.webp";
import d_m_biror_marta_hech from "./dars/rasm/m-biror-marta-hech.webp";
import d_m_blog from "./dars/rasm/m-blog.webp";
import d_m_boldi_aylandi from "./dars/rasm/m-boldi-aylandi.webp";
import d_m_bolgan from "./dars/rasm/m-bolgan.webp";
import d_m_boron from "./dars/rasm/m-boron.webp";
import d_m_bosh_vaqt from "./dars/rasm/m-bosh-vaqt.webp";
import d_m_bolalik from "./dars/rasm/m-bolalik.webp";
import d_m_boshlovchi from "./dars/rasm/m-boshlovchi.webp";
import d_m_boshpana from "./dars/rasm/m-boshpana.webp";
import d_m_bosmoq from "./dars/rasm/m-bosmoq.webp";
import d_m_buyuk from "./dars/rasm/m-buyuk.webp";
import d_m_buyuk_ipak_yoli from "./dars/rasm/m-buyuk-ipak-yoli.webp";
import d_m_buyum_narsa from "./dars/rasm/m-buyum-narsa.webp";
import d_m_buyurtma_bermoq from "./dars/rasm/m-buyurtma-bermoq.webp";
import d_m_buyurtma_qilmoq_soramoq from "./dars/rasm/m-buyurtma-qilmoq-soramoq.webp";
import d_m_chamadon_yigmoq from "./dars/rasm/m-chamadon-yigmoq.webp";
import d_m_chamadonni_yigmoq from "./dars/rasm/m-chamadonni-yigmoq.webp";
import d_m_chang from "./dars/rasm/m-chang.webp";
import d_m_chang_artmoq from "./dars/rasm/m-chang-artmoq.webp";
import d_m_changyutgich from "./dars/rasm/m-changyutgich.webp";
import d_m_changyutgich_bilan_tozalamoq from "./dars/rasm/m-changyutgich-bilan-tozalamoq.webp";
import d_m_chiqindilar_axlat from "./dars/rasm/m-chiqindilar-axlat.webp";
import d_m_chiqish from "./dars/rasm/m-chiqish.webp";
import d_m_chochib_ketmoq from "./dars/rasm/m-chochib-ketmoq.webp";
import d_m_chop_etmoq from "./dars/rasm/m-chop-etmoq.webp";
import d_m_choy_puli from "./dars/rasm/m-choy-puli.webp";
import d_m_choychaqa from "./dars/rasm/m-choychaqa.webp";
import d_m_dasturxonni_yigishtirmoq from "./dars/rasm/m-dasturxonni-yigishtirmoq.webp";
import d_m_dengizchi from "./dars/rasm/m-dengizchi.webp";
import d_m_desert_shirinlik from "./dars/rasm/m-desert-shirinlik.webp";
import d_m_detektiv_izquvar from "./dars/rasm/m-detektiv-izquvar.webp";
import d_m_detektiv_tergovchi from "./dars/rasm/m-detektiv-tergovchi.webp";
import d_m_donishmand_olim from "./dars/rasm/m-donishmand-olim.webp";
import d_m_doston from "./dars/rasm/m-doston.webp";
import d_m_duxovka from "./dars/rasm/m-duxovka.webp";
import d_m_ekran_oldidagi_vaqt from "./dars/rasm/m-ekran-oldidagi-vaqt.webp";
import d_m_elektr from "./dars/rasm/m-elektr.webp";
import d_m_elektr_toki from "./dars/rasm/m-elektr-toki.webp";
import d_m_energiya from "./dars/rasm/m-energiya.webp";
import d_m_energiya_quvvat from "./dars/rasm/m-energiya-quvvat.webp";
import d_m_eslamoq_esda_tutmoq from "./dars/rasm/m-eslamoq-esda-tutmoq.webp";
import d_m_falokat_fojia from "./dars/rasm/m-falokat-fojia.webp";
import d_m_fan from "./dars/rasm/m-fan.webp";
import d_m_fast_fud_tez_tayyorlanadigan_ovqat from "./dars/rasm/m-fast-fud-tez-tayyorlanadigan-ovqat.webp";
import d_m_fastfud_tez_tayyor_ovqat from "./dars/rasm/m-fastfud-tez-tayyor-ovqat.webp";
import d_m_foiz from "./dars/rasm/m-foiz.webp";
import d_m_foydalanmoq_ishlatmoq from "./dars/rasm/m-foydalanmoq-ishlatmoq.webp";
import d_m_galati from "./dars/rasm/m-galati.webp";
import d_m_gor from "./dars/rasm/m-gor.webp";
import d_m_goyib_bolmoq_yoqolmoq from "./dars/rasm/m-goyib-bolmoq-yoqolmoq.webp";
import d_m_gulchambar_girlyanda from "./dars/rasm/m-gulchambar-girlyanda.webp";
import d_m_gullarga_suv_quymoq from "./dars/rasm/m-gullarga-suv-quymoq.webp";
import d_m_gullarni_sugormoq from "./dars/rasm/m-gullarni-sugormoq.webp";
import d_m_guruh from "./dars/rasm/m-guruh.webp";
import d_m_hali_emas from "./dars/rasm/m-hali-emas.webp";
import d_m_hali_allaqachon from "./dars/rasm/m-hali-allaqachon.webp";
import d_m_hashar_tozalik_kuni from "./dars/rasm/m-hashar-tozalik-kuni.webp";
import d_m_havo from "./dars/rasm/m-havo.webp";
import d_m_havola from "./dars/rasm/m-havola.webp";
import d_m_himoya_qilmoq from "./dars/rasm/m-himoya-qilmoq.webp";
import d_m_himoya_qilmoq_asramoq from "./dars/rasm/m-himoya-qilmoq-asramoq.webp";
import d_m_hisob from "./dars/rasm/m-hisob.webp";
import d_m_hisoblamoq from "./dars/rasm/m-hisoblamoq.webp";
import d_m_hozirgina from "./dars/rasm/m-hozirgina.webp";
import d_m_hozirgina_qilmoq from "./dars/rasm/m-hozirgina-qilmoq.webp";
import d_m_hozirgina_endigina from "./dars/rasm/m-hozirgina-endigina.webp";
import d_m_hukmdor from "./dars/rasm/m-hukmdor.webp";
import d_m_huquqi_bor_ruxsat_bor from "./dars/rasm/m-huquqi-bor-ruxsat-bor.webp";
import d_m_ifloslanish from "./dars/rasm/m-ifloslanish.webp";
import d_m_ikki_marta from "./dars/rasm/m-ikki-marta.webp";
import d_m_internet from "./dars/rasm/m-internet.webp";
import d_m_ipak from "./dars/rasm/m-ipak.webp";
import d_m_iqlim from "./dars/rasm/m-iqlim.webp";
import d_m_ixtiro from "./dars/rasm/m-ixtiro.webp";
import d_m_ixtiro_qildi from "./dars/rasm/m-ixtiro-qildi.webp";
import d_m_ixtiro_qilmoq from "./dars/rasm/m-ixtiro-qilmoq.webp";
import d_m_ixtirochi from "./dars/rasm/m-ixtirochi.webp";
import d_m_iz from "./dars/rasm/m-iz.webp";
import d_m_iz_dalil from "./dars/rasm/m-iz-dalil.webp";
import d_m_izoh_sharh from "./dars/rasm/m-izoh-sharh.webp";
import d_m_jahon_chempioni from "./dars/rasm/m-jahon-chempioni.webp";
import d_m_jiqqa_hol from "./dars/rasm/m-jiqqa-hol.webp";
import d_m_jomrak from "./dars/rasm/m-jomrak.webp";
import d_m_jomrak_kran from "./dars/rasm/m-jomrak-kran.webp";
import d_m_joylamoq_elon_qilmoq from "./dars/rasm/m-joylamoq-elon-qilmoq.webp";
import d_m_joylamoq_qadoqlamoq from "./dars/rasm/m-joylamoq-qadoqlamoq.webp";
import d_m_jurat_qilmoq from "./dars/rasm/m-jurat-qilmoq.webp";
import d_m_jurnalist from "./dars/rasm/m-jurnalist.webp";
import d_m_kanal from "./dars/rasm/m-kanal.webp";
import d_m_karton from "./dars/rasm/m-karton.webp";
import d_m_karvon from "./dars/rasm/m-karvon.webp";
import d_m_kashf_qildi from "./dars/rasm/m-kashf-qildi.webp";
import d_m_kashf_qilmoq from "./dars/rasm/m-kashf-qilmoq.webp";
import d_m_kashfiyotchi_sayyoh_tadqiqotchi from "./dars/rasm/m-kashfiyotchi-sayyoh-tadqiqotchi.webp";
import d_m_kech_qolmoq from "./dars/rasm/m-kech-qolmoq.webp";
import d_m_kerak_emas_mumkin_emas from "./dars/rasm/m-kerak-emas-mumkin-emas.webp";
import d_m_kerak_emas_qilmagan_maqul from "./dars/rasm/m-kerak-emas-qilmagan-maqul.webp";
import d_m_kerak_lozim from "./dars/rasm/m-kerak-lozim.webp";
import d_m_kerak_majbur_bolmoq from "./dars/rasm/m-kerak-majbur-bolmoq.webp";
import d_m_kerak_shart from "./dars/rasm/m-kerak-shart.webp";
import d_m_ketgan from "./dars/rasm/m-ketgan.webp";
import d_m_kir_yuviladigan_kiyim from "./dars/rasm/m-kir-yuviladigan-kiyim.webp";
import d_m_kirish from "./dars/rasm/m-kirish.webp";
import d_m_kirish_joyi from "./dars/rasm/m-kirish-joyi.webp";
import d_m_kishi_odamlar from "./dars/rasm/m-kishi-odamlar.webp";
import d_m_klub_togarak from "./dars/rasm/m-klub-togarak.webp";
import d_m_kochirib_olmoq from "./dars/rasm/m-kochirib-olmoq.webp";
import d_m_kochirmoq from "./dars/rasm/m-kochirmoq.webp";
import d_m_kochirmoq_aldamoq from "./dars/rasm/m-kochirmoq-aldamoq.webp";
import d_m_kokarish from "./dars/rasm/m-kokarish.webp";
import d_m_kongilli from "./dars/rasm/m-kongilli.webp";
import d_m_kop_marta from "./dars/rasm/m-kop-marta.webp";
import d_m_kopchilik from "./dars/rasm/m-kopchilik.webp";
import d_m_kopchilik_aksariyat from "./dars/rasm/m-kopchilik-aksariyat.webp";
import d_m_korsatuv from "./dars/rasm/m-korsatuv.webp";
import d_m_kotarib_olib_bormoq from "./dars/rasm/m-kotarib-olib-bormoq.webp";
import d_m_kolleksiya_toplam from "./dars/rasm/m-kolleksiya-toplam.webp";
import d_m_konteyner from "./dars/rasm/m-konteyner.webp";
import d_m_kubik_tortburchak_bolak from "./dars/rasm/m-kubik-tortburchak-bolak.webp";
import d_m_kulba_kichik_uy from "./dars/rasm/m-kulba-kichik-uy.webp";
import d_m_kundalik_hayot from "./dars/rasm/m-kundalik-hayot.webp";
import d_m_kundalik_tartib_odat from "./dars/rasm/m-kundalik-tartib-odat.webp";
import d_m_kundalik_har_kungi from "./dars/rasm/m-kundalik-har-kungi.webp";
import d_m_lampochka from "./dars/rasm/m-lampochka.webp";
import d_m_lat_yedirmoq_urib_olmoq from "./dars/rasm/m-lat-yedirmoq-urib-olmoq.webp";
import d_m_lat_yemoq_joyini_ogritmoq from "./dars/rasm/m-lat-yemoq-joyini-ogritmoq.webp";
import d_m_lat_yemoq_ogritib_olmoq from "./dars/rasm/m-lat-yemoq-ogritib-olmoq.webp";
import d_m_layk_bosmoq from "./dars/rasm/m-layk-bosmoq.webp";
import d_m_loyiha from "./dars/rasm/m-loyiha.webp";
import d_m_mahsulotlar from "./dars/rasm/m-mahsulotlar.webp";
import d_m_majbur from "./dars/rasm/m-majbur.webp";
import d_m_majbur_bolmoq_kerak from "./dars/rasm/m-majbur-bolmoq-kerak.webp";
import d_m_majburiy from "./dars/rasm/m-majburiy.webp";
import d_m_maktab_formasi from "./dars/rasm/m-maktab-formasi.webp";
import d_m_maktabga_yol from "./dars/rasm/m-maktabga-yol.webp";
import d_m_maqola from "./dars/rasm/m-maqola.webp";
import d_m_marjon_boyinbog from "./dars/rasm/m-marjon-boyinbog.webp";
import d_m_marjon_boyinga_taqiladigan_zanjir from "./dars/rasm/m-marjon-boyinga-taqiladigan-zanjir.webp";
import d_m_marjon_boyinshoda from "./dars/rasm/m-marjon-boyinshoda.webp";
import d_m_marshrutka from "./dars/rasm/m-marshrutka.webp";
import d_m_masala from "./dars/rasm/m-masala.webp";
import d_m_masalliq from "./dars/rasm/m-masalliq.webp";
import d_m_maslahat from "./dars/rasm/m-maslahat.webp";
import d_m_maslahat_bermoq from "./dars/rasm/m-maslahat-bermoq.webp";
import d_m_matbuot from "./dars/rasm/m-matbuot.webp";
import d_m_mehmon_qilmoq_siylamoq from "./dars/rasm/m-mehmon-qilmoq-siylamoq.webp";
import d_m_menyu from "./dars/rasm/m-menyu.webp";
import d_m_menyu_taomnoma from "./dars/rasm/m-menyu-taomnoma.webp";
import d_m_milliy from "./dars/rasm/m-milliy.webp";
import d_m_minib_korgan from "./dars/rasm/m-minib-korgan.webp";
import d_m_minmoq_chiqmoq from "./dars/rasm/m-minmoq-chiqmoq.webp";
import d_m_mol_tovar from "./dars/rasm/m-mol-tovar.webp";
import d_m_mukofot from "./dars/rasm/m-mukofot.webp";
import d_m_mumkin from "./dars/rasm/m-mumkin.webp";
import d_m_munajjim_astronom from "./dars/rasm/m-munajjim-astronom.webp";
import d_m_nafas_olmoq from "./dars/rasm/m-nafas-olmoq.webp";
import d_m_nihoyat_oxiri from "./dars/rasm/m-nihoyat-oxiri.webp";
import d_m_nihoyat_oxirida from "./dars/rasm/m-nihoyat-oxirida.webp";
import d_m_nol from "./dars/rasm/m-nol.webp";
import d_m_notanish_odam from "./dars/rasm/m-notanish-odam.webp";
import d_m_noutbuk from "./dars/rasm/m-noutbuk.webp";
import d_m_novvoy from "./dars/rasm/m-novvoy.webp";
import d_m_ochirmoq from "./dars/rasm/m-ochirmoq.webp";
import d_m_ogirlamoq from "./dars/rasm/m-ogirlamoq.webp";
import d_m_ogri from "./dars/rasm/m-ogri.webp";
import d_m_oquv_fani from "./dars/rasm/m-oquv-fani.webp";
import d_m_osha_paytda from "./dars/rasm/m-osha-paytda.webp";
import d_m_obunachi from "./dars/rasm/m-obunachi.webp";
import d_m_obunachilar from "./dars/rasm/m-obunachilar.webp";
import d_m_odat from "./dars/rasm/m-odat.webp";
import d_m_ofitsiant from "./dars/rasm/m-ofitsiant.webp";
import d_m_ogrimoq_jarohatlamoq from "./dars/rasm/m-ogrimoq-jarohatlamoq.webp";
import d_m_old_tomonda from "./dars/rasm/m-old-tomonda.webp";
import d_m_oldingi_planda from "./dars/rasm/m-oldingi-planda.webp";
import d_m_olim from "./dars/rasm/m-olim.webp";
import d_m_olim_alloma from "./dars/rasm/m-olim-alloma.webp";
import d_m_olimpiya_oyinlari from "./dars/rasm/m-olimpiya-oyinlari.webp";
import d_m_onlayn from "./dars/rasm/m-onlayn.webp";
import d_m_onlayn_internetda from "./dars/rasm/m-onlayn-internetda.webp";
import d_m_onlayn_tarmoqda from "./dars/rasm/m-onlayn-tarmoqda.webp";
import d_m_orqa_planda from "./dars/rasm/m-orqa-planda.webp";
import d_m_orqa_planda_orqada from "./dars/rasm/m-orqa-planda-orqada.webp";
import d_m_orqa_tomonda from "./dars/rasm/m-orqa-tomonda.webp";
import d_m_otda_yurmoq from "./dars/rasm/m-otda-yurmoq.webp";
import d_m_oxirida from "./dars/rasm/m-oxirida.webp";
import d_m_parol from "./dars/rasm/m-parol.webp";
import d_m_pishirmoq from "./dars/rasm/m-pishirmoq.webp";
import d_m_piyoda_sayohat from "./dars/rasm/m-piyoda-sayohat.webp";
import d_m_piyoda_sayr_sayohat from "./dars/rasm/m-piyoda-sayr-sayohat.webp";
import d_m_piyodalar_yolagi from "./dars/rasm/m-piyodalar-yolagi.webp";
import d_m_piyodalar_yolagi_trotuar from "./dars/rasm/m-piyodalar-yolagi-trotuar.webp";
import d_m_plastik from "./dars/rasm/m-plastik.webp";
import d_m_plastmassa_plastik from "./dars/rasm/m-plastmassa-plastik.webp";
import d_m_pled from "./dars/rasm/m-pled.webp";
import d_m_podkast from "./dars/rasm/m-podkast.webp";
import d_m_posilka from "./dars/rasm/m-posilka.webp";
import d_m_post from "./dars/rasm/m-post.webp";
import d_m_qachondir_hech from "./dars/rasm/m-qachondir-hech.webp";
import d_m_qarsildoq from "./dars/rasm/m-qarsildoq.webp";
import d_m_qaynamoq from "./dars/rasm/m-qaynamoq.webp";
import d_m_qaynatib_pishirmoq from "./dars/rasm/m-qaynatib-pishirmoq.webp";
import d_m_qaynatmoq from "./dars/rasm/m-qaynatmoq.webp";
import d_m_qaynatmoq_qaynamoq from "./dars/rasm/m-qaynatmoq-qaynamoq.webp";
import d_m_qayta_foydalanmoq from "./dars/rasm/m-qayta-foydalanmoq.webp";
import d_m_qayta_ishlamoq from "./dars/rasm/m-qayta-ishlamoq.webp";
import d_m_qayta_ishlatmoq from "./dars/rasm/m-qayta-ishlatmoq.webp";
import d_m_qol_silkitmoq from "./dars/rasm/m-qol-silkitmoq.webp";
import d_m_qolyozma from "./dars/rasm/m-qolyozma.webp";
import d_m_qoriqchi from "./dars/rasm/m-qoriqchi.webp";
import d_m_qorqib_ketmoq from "./dars/rasm/m-qorqib-ketmoq.webp";
import d_m_qoida from "./dars/rasm/m-qoida.webp";
import d_m_qoidalar_nizom from "./dars/rasm/m-qoidalar-nizom.webp";
import d_m_qon_oqmoq from "./dars/rasm/m-qon-oqmoq.webp";
import d_m_qopqoq from "./dars/rasm/m-qopqoq.webp";
import d_m_qor_qoploni from "./dars/rasm/m-qor-qoploni.webp";
import d_m_qormoq from "./dars/rasm/m-qormoq.webp";
import d_m_qorovul_soqchi from "./dars/rasm/m-qorovul-soqchi.webp";
import d_m_qoshiq_2 from "./dars/rasm/m-qoshiq-2.webp";
import d_m_qovurmoq from "./dars/rasm/m-qovurmoq.webp";
import d_m_qoya from "./dars/rasm/m-qoya.webp";
import d_m_qurib_qolmoq from "./dars/rasm/m-qurib-qolmoq.webp";
import d_m_rasadxona from "./dars/rasm/m-rasadxona.webp";
import d_m_rasmga_tushish_uchun_turmoq from "./dars/rasm/m-rasmga-tushish-uchun-turmoq.webp";
import d_m_repetitsiya from "./dars/rasm/m-repetitsiya.webp";
import d_m_retsept_taom_tayyorlash_usuli from "./dars/rasm/m-retsept-taom-tayyorlash-usuli.webp";
import d_m_ruxsat_etilgan from "./dars/rasm/m-ruxsat-etilgan.webp";
import d_m_sarguzasht from "./dars/rasm/m-sarguzasht.webp";
import d_m_sarlavha from "./dars/rasm/m-sarlavha.webp";
import d_m_savdogar from "./dars/rasm/m-savdogar.webp";
import d_m_sayohatchi_kashfiyotchi from "./dars/rasm/m-sayohatchi-kashfiyotchi.webp";
import d_m_sayyoh_kashfiyotchi from "./dars/rasm/m-sayyoh-kashfiyotchi.webp";
import d_m_sayyoh_tadqiqotchi from "./dars/rasm/m-sayyoh-tadqiqotchi.webp";
import d_m_serial from "./dars/rasm/m-serial.webp";
import d_m_sersuv_shirali from "./dars/rasm/m-sersuv-shirali.webp";
import d_m_shalabbo_hol from "./dars/rasm/m-shalabbo-hol.webp";
import d_m_shart_emas from "./dars/rasm/m-shart-emas.webp";
import d_m_shart_emas_kerak_emas from "./dars/rasm/m-shart-emas-kerak-emas.webp";
import d_m_shart_majbur from "./dars/rasm/m-shart-majbur.webp";
import d_m_shaxsiy from "./dars/rasm/m-shaxsiy.webp";
import d_m_shaxsiy_maxfiy from "./dars/rasm/m-shaxsiy-maxfiy.webp";
import d_m_shaxsiy_yopiq from "./dars/rasm/m-shaxsiy-yopiq.webp";
import d_m_sher from "./dars/rasm/m-sher.webp";
import d_m_shisha_stakan from "./dars/rasm/m-shisha-stakan.webp";
import d_m_shivit from "./dars/rasm/m-shivit.webp";
import d_m_shivit_ukrop from "./dars/rasm/m-shivit-ukrop.webp";
import d_m_shorva_suvi_bulyon from "./dars/rasm/m-shorva-suvi-bulyon.webp";
import d_m_shorva_suvi_qaynatma from "./dars/rasm/m-shorva-suvi-qaynatma.webp";
import d_m_shoir from "./dars/rasm/m-shoir.webp";
import d_m_shu_kunlarda from "./dars/rasm/m-shu-kunlarda.webp";
import d_m_shu_kunlarda_hozirgi_paytda from "./dars/rasm/m-shu-kunlarda-hozirgi-paytda.webp";
import d_m_shugullanmoq from "./dars/rasm/m-shugullanmoq.webp";
import d_m_shundan_keyin from "./dars/rasm/m-shundan-keyin.webp";
import d_m_silkitmoq from "./dars/rasm/m-silkitmoq.webp";
import d_m_sinab_korgan_tatib_korgan from "./dars/rasm/m-sinab-korgan-tatib-korgan.webp";
import d_m_sinab_kormoq_urinmoq from "./dars/rasm/m-sinab-kormoq-urinmoq.webp";
import d_m_sirpanmoq from "./dars/rasm/m-sirpanmoq.webp";
import d_m_songgi_paytlarda from "./dars/rasm/m-songgi-paytlarda.webp";
import d_m_sorovnoma from "./dars/rasm/m-sorovnoma.webp";
import d_m_sodir_bolmoq from "./dars/rasm/m-sodir-bolmoq.webp";
import d_m_sodir_bolmoq_bolmoq from "./dars/rasm/m-sodir-bolmoq-bolmoq.webp";
import d_m_sotib_olgan from "./dars/rasm/m-sotib-olgan.webp";
import d_m_stiker_yopishqoq_rasm from "./dars/rasm/m-stiker-yopishqoq-rasm.webp";
import d_m_suratga_olmoq from "./dars/rasm/m-suratga-olmoq.webp";
import d_m_suratga_tushish_uchun_turmoq from "./dars/rasm/m-suratga-tushish-uchun-turmoq.webp";
import d_m_taassurot from "./dars/rasm/m-taassurot.webp";
import d_m_tabel from "./dars/rasm/m-tabel.webp";
import d_m_tabiat from "./dars/rasm/m-tabiat.webp";
import d_m_taklifnoma from "./dars/rasm/m-taklifnoma.webp";
import d_m_tandir from "./dars/rasm/m-tandir.webp";
import d_m_taqdimot_maruza from "./dars/rasm/m-taqdimot-maruza.webp";
import d_m_taqillatmoq from "./dars/rasm/m-taqillatmoq.webp";
import d_m_taqinchoq from "./dars/rasm/m-taqinchoq.webp";
import d_m_taqiqlangan from "./dars/rasm/m-taqiqlangan.webp";
import d_m_tarjimai_hol from "./dars/rasm/m-tarjimai-hol.webp";
import d_m_tashlab_yubormoq from "./dars/rasm/m-tashlab-yubormoq.webp";
import d_m_tasvirlamoq from "./dars/rasm/m-tasvirlamoq.webp";
import d_m_tatib_kormoq_sinab_kormoq from "./dars/rasm/m-tatib-kormoq-sinab-kormoq.webp";
import d_m_taxir_achchiq from "./dars/rasm/m-taxir-achchiq.webp";
import d_m_tejamoq from "./dars/rasm/m-tejamoq.webp";
import d_m_tejamoq_asramoq from "./dars/rasm/m-tejamoq-asramoq.webp";
import d_m_telekanal from "./dars/rasm/m-telekanal.webp";
import d_m_temir_banka from "./dars/rasm/m-temir-banka.webp";
import d_m_tibbiyot from "./dars/rasm/m-tibbiyot.webp";
import d_m_togramoq from "./dars/rasm/m-togramoq.webp";
import d_m_toplam_kolleksiya from "./dars/rasm/m-toplam-kolleksiya.webp";
import d_m_toplamoq_kolleksiya_qilmoq from "./dars/rasm/m-toplamoq-kolleksiya-qilmoq.webp";
import d_m_tomchilamoq from "./dars/rasm/m-tomchilamoq.webp";
import d_m_tomoshabinlar from "./dars/rasm/m-tomoshabinlar.webp";
import d_m_tormoz_bermoq from "./dars/rasm/m-tormoz-bermoq.webp";
import d_m_tormozlamoq from "./dars/rasm/m-tormozlamoq.webp";
import d_m_tova from "./dars/rasm/m-tova.webp";
import d_m_tozalash from "./dars/rasm/m-tozalash.webp";
import d_m_tozalash_tozalik from "./dars/rasm/m-tozalash-tozalik.webp";
import d_m_tushunmoq from "./dars/rasm/m-tushunmoq.webp";
import d_m_tutun from "./dars/rasm/m-tutun.webp";
import d_m_tuzsiz_tamsiz from "./dars/rasm/m-tuzsiz-tamsiz.webp";
import d_m_uchrashgan_tanishgan from "./dars/rasm/m-uchrashgan-tanishgan.webp";
import d_m_uchratmoq from "./dars/rasm/m-uchratmoq.webp";
import d_m_uloqtirib_tashlamoq from "./dars/rasm/m-uloqtirib-tashlamoq.webp";
import d_m_unib_chiqmoq from "./dars/rasm/m-unib-chiqmoq.webp";
import d_m_uy_ishi_uy_yumushi from "./dars/rasm/m-uy-ishi-uy-yumushi.webp";
import d_m_uy_yumushlari from "./dars/rasm/m-uy-yumushlari.webp";
import d_m_vafot_etdi from "./dars/rasm/m-vafot-etdi.webp";
import d_m_vafot_etmoq from "./dars/rasm/m-vafot-etmoq.webp";
import d_m_vafot_etmoq_olmoq from "./dars/rasm/m-vafot-etmoq-olmoq.webp";
import d_m_vatan_ona_yurt from "./dars/rasm/m-vatan-ona-yurt.webp";
import d_m_vazir from "./dars/rasm/m-vazir.webp";
import d_m_veb_sayt from "./dars/rasm/m-veb-sayt.webp";
import d_m_velosipedchi from "./dars/rasm/m-velosipedchi.webp";
import d_m_video from "./dars/rasm/m-video.webp";
import d_m_xabar from "./dars/rasm/m-xabar.webp";
import d_m_xamir from "./dars/rasm/m-xamir.webp";
import d_m_xavfsiz from "./dars/rasm/m-xavfsiz.webp";
import d_m_xavfsizlik from "./dars/rasm/m-xavfsizlik.webp";
import d_m_xohlamoq_ishtiyoqi_bolmoq from "./dars/rasm/m-xohlamoq-ishtiyoqi-bolmoq.webp";
import d_m_yangiliklar from "./dars/rasm/m-yangiliklar.webp";
import d_m_yaqinda from "./dars/rasm/m-yaqinda.webp";
import d_m_yaqinda_songgi_paytda from "./dars/rasm/m-yaqinda-songgi-paytda.webp";
import d_m_yaqinda_yaqinda_bir_kuni from "./dars/rasm/m-yaqinda-yaqinda-bir-kuni.webp";
import d_m_yarmi from "./dars/rasm/m-yarmi.webp";
import d_m_yaxshilamoq_yaxshilanmoq from "./dars/rasm/m-yaxshilamoq-yaxshilanmoq.webp";
import d_m_yetarli_yetarlicha from "./dars/rasm/m-yetarli-yetarlicha.webp";
import d_m_yettinchi from "./dars/rasm/m-yettinchi.webp";
import d_m_yigmoq_kolleksiya_qilmoq from "./dars/rasm/m-yigmoq-kolleksiya-qilmoq.webp";
import d_m_yigmoq_toplamoq from "./dars/rasm/m-yigmoq-toplamoq.webp";
import d_m_yol_sumkasi from "./dars/rasm/m-yol-sumkasi.webp";
import d_m_yolak_koridor from "./dars/rasm/m-yolak-koridor.webp";
import d_m_yoqolib_ketmoq from "./dars/rasm/m-yoqolib-ketmoq.webp";
import d_m_yoqolmoq_goyib_bolmoq from "./dars/rasm/m-yoqolmoq-goyib-bolmoq.webp";
import d_m_yogli from "./dars/rasm/m-yogli.webp";
import d_m_yomon_kormoq from "./dars/rasm/m-yomon-kormoq.webp";
import d_m_yopishtirmoq from "./dars/rasm/m-yopishtirmoq.webp";
import d_m_yorliq from "./dars/rasm/m-yorliq.webp";
import d_m_yorqin_nimcha_jilet from "./dars/rasm/m-yorqin-nimcha-jilet.webp";
import d_m_yovvoyi_tongiz from "./dars/rasm/m-yovvoyi-tongiz.webp";
import d_m_yozuv_lavha from "./dars/rasm/m-yozuv-lavha.webp";
import d_m_yuborgan from "./dars/rasm/m-yuborgan.webp";
import d_m_yuk_bagaj from "./dars/rasm/m-yuk-bagaj.webp";
import d_m_yuklab_olmoq from "./dars/rasm/m-yuklab-olmoq.webp";
import d_m_zararli_fastfud_ovqat from "./dars/rasm/m-zararli-fastfud-ovqat.webp";
export const DARS_RASM = {
  "d_m-shamolli": d_m_shamolli,
  "d_m-shanba": d_m_shanba,
  "d_m-shippak": d_m_shippak,
  "d_m-shlyapa": d_m_shlyapa,
  "d_m-sichqon": d_m_sichqon,
  "d_m-sichqoncha": d_m_sichqoncha,
  "d_m-stol": d_m_stol,
  "d_m-tabassum": d_m_tabassum,
  "d_m-tanaffus": d_m_tanaffus,
  "d_m-tepmoq": d_m_tepmoq,
  "d_m-tirmashib-chiqish": d_m_tirmashib_chiqish,
  "d_m-tirmashmoq": d_m_tirmashmoq,
  "d_m-tufli": d_m_tufli,
  "d_m-tufli-poyabzal": d_m_tufli_poyabzal,
  "d_m-u-yerda": d_m_u_yerda,
  "d_m-uchish": d_m_uchish,
  "d_m-ular": d_m_ular,
  "d_m-ular-qayerda": d_m_ular_qayerda,
  "d_m-ustida": d_m_ustida,
  "d_m-uxlamoq": d_m_uxlamoq,
  "d_m-uxlash": d_m_uxlash,
  "d_m-uyqum-keldi": d_m_uyqum_keldi,
  "d_m-qahva": d_m_qahva,
  "d_m-qancha": d_m_qancha,
  "d_m-qancha-turadi": d_m_qancha_turadi,
  "d_m-qanday-borsa-boladi": d_m_qanday_borsa_boladi,
  "d_m-qaytim": d_m_qaytim,
  "d_m-qidirmoq": d_m_qidirmoq,
  "d_m-qirq": d_m_qirq,
  "d_m-qishloq-joy": d_m_qishloq_joy,
  "d_m-qishloq-joy-dala": d_m_qishloq_joy_dala,
  "d_m-qongir-kashtan-rang": d_m_qongir_kashtan_rang,
  "d_m-qongiroq-qilmoq": d_m_qongiroq_qilmoq,
  "d_m-qor-bobo": d_m_qor_bobo,
  "d_m-qora-sochli-qoramagiz": d_m_qora_sochli_qoramagiz,
  "d_m-qora-sochli-qoramtir": d_m_qora_sochli_qoramtir,
  "d_m-qoshlar": d_m_qoshlar,
  "d_m-qozon": d_m_qozon,
  "d_m-quloqchinlar": d_m_quloqchinlar,
  "d_m-quymoq": d_m_quymoq,
  "d_m-quyoshda-toblanmoq": d_m_quyoshda_toblanmoq,
  "d_m-roparasida": d_m_roparasida,
  "d_m-sahna": d_m_sahna,
  "d_m-salfetka": d_m_salfetka,
  "d_m-sariq-sochli": d_m_sariq_sochli,
  "d_m-sariyog": d_m_sariyog,
  "d_m-savol": d_m_savol,
  "d_m-sentabr": d_m_sentabr,
  "d_m-sentyabr": d_m_sentyabr,
  "d_m-sepkillar": d_m_sepkillar,
  "d_m-sevimli": d_m_sevimli,
  "d_m-shahar-xaritasi": d_m_shahar_xaritasi,
  "d_m-shisha": d_m_shisha,
  "d_m-shisha-butilka": d_m_shisha_butilka,
  "d_m-shivirlamoq": d_m_shivirlamoq,
  "d_m-shokolad": d_m_shokolad,
  "d_m-shovqin": d_m_shovqin,
  "d_m-silliq-togri": d_m_silliq_togri,
  "d_m-sir": d_m_sir,
  "d_m-sirk": d_m_sirk,
  "d_m-sirpanchiq": d_m_sirpanchiq,
  "d_m-som": d_m_som,
  "d_m-soqmoq": d_m_soqmoq,
  "d_m-soramoq": d_m_soramoq,
  "d_m-soch-taramoq": d_m_soch_taramoq,
  "d_m-sochini-taramoq": d_m_sochini_taramoq,
  "d_m-sotmoq": d_m_sotmoq,
  "d_m-sotuvchi": d_m_sotuvchi,
  "d_m-sovga-qilmoq": d_m_sovga_qilmoq,
  "d_m-soy-kichik-daryo": d_m_soy_kichik_daryo,
  "d_m-supurmoq": d_m_supurmoq,
  "d_m-tatil": d_m_tatil,
  "d_m-tabriklamoq": d_m_tabriklamoq,
  "d_m-tabriklayman": d_m_tabriklayman,
  "d_m-tabriknoma": d_m_tabriknoma,
  "d_m-taklif-qilmoq": d_m_taklif_qilmoq,
  "d_m-tayyorlamoq": d_m_tayyorlamoq,
  "d_m-teatr": d_m_teatr,
  "d_m-tekis-silliq": d_m_tekis_silliq,
  "d_m-tepalikdan-sirpanchiq": d_m_tepalikdan_sirpanchiq,
  "d_m-terib-olmoq": d_m_terib_olmoq,
  "d_m-termoq-yigmoq": d_m_termoq_yigmoq,
  "d_m-tez-tez": d_m_tez_tez,
  "d_m-tez-tez-kopincha": d_m_tez_tez_kopincha,
  "d_m-tik-turgan": d_m_tik_turgan,
  "d_m-tik-turmoq": d_m_tik_turmoq,
  "d_m-togarak-klub": d_m_togarak_klub,
  "d_m-tolamoq": d_m_tolamoq,
  "d_m-toq-rangli": d_m_toq_rangli,
  "d_m-topmoq": d_m_topmoq,
  "d_m-tushmoq-yiqilmoq": d_m_tushmoq_yiqilmoq,
  "d_m-uyatchan": d_m_uyatchan,
  "d_m-uzmoq": d_m_uzmoq,
  "d_m-video-oyinlar": d_m_video_oyinlar,
  "d_m-viktorina": d_m_viktorina,
  "d_m-vokzal": d_m_vokzal,
  "d_m-xarid-qilmoq": d_m_xarid_qilmoq,
  "d_m-xarid-royxati": d_m_xarid_royxati,
  "d_m-xaridlar-royxati": d_m_xaridlar_royxati,
  "d_m-xaridor": d_m_xaridor,
  "d_m-xat": d_m_xat,
  "d_m-yana-biror-narsa": d_m_yana_biror_narsa,
  "d_m-yangi-yil": d_m_yangi_yil,
  "d_m-yanvar": d_m_yanvar,
  "d_m-yarim-tun": d_m_yarim_tun,
  "d_m-yashirinmoq": d_m_yashirinmoq,
  "d_m-yolak-soqmoq": d_m_yolak_soqmoq,
  "d_m-yolovchi": d_m_yolovchi,
  "d_m-yog": d_m_yog,
  "d_m-yogurt": d_m_yogurt,
  "d_m-yogurt-qatiq": d_m_yogurt_qatiq,
  "d_m-yordamchi": d_m_yordamchi,
  "d_m-yozmoq": d_m_yozmoq,
  "d_m-gacha": d_m_gacha,
  "d_mat-sanoq-chopi": d_mat_sanoq_chopi,
  "d_mat-onlik-boglam": d_mat_onlik_boglam,
  "d_mat-abak": d_mat_abak,
  "d_mat-son-oqi": d_mat_son_oqi,
  "d_mat-yuzlik-jadval": d_mat_yuzlik_jadval,
  "d_mat-kasr-pitsa-yarim": d_mat_kasr_pitsa_yarim,
  "d_mat-kasr-pitsa-chorak": d_mat_kasr_pitsa_chorak,
  "d_mat-kasr-pitsa-uchdan": d_mat_kasr_pitsa_uchdan,
  "d_mat-kasr-tasma": d_mat_kasr_tasma,
  "d_mat-tarozi-palla": d_mat_tarozi_palla,
  "d_mat-tarozi-ogir": d_mat_tarozi_ogir,
  "d_mat-sirkul": d_mat_sirkul,
  "d_mat-transportir": d_mat_transportir,
  "d_mat-burchakli-chizgich": d_mat_burchakli_chizgich,
  "d_mat-ruletka": d_mat_ruletka,
  "d_mat-menzurka-litr": d_mat_menzurka_litr,
  "d_mat-soat-bosh": d_mat_soat_bosh,
  "d_mat-soat-mil-katta": d_mat_soat_mil_katta,
  "d_mat-soat-mil-kichik": d_mat_soat_mil_kichik,
  "d_mat-kalendar-oy": d_mat_kalendar_oy,
  "d_mat-simmetriya-kapalak": d_mat_simmetriya_kapalak,
  "d_mat-burchak-otkir": d_mat_burchak_otkir,
  "d_mat-burchak-togri": d_mat_burchak_togri,
  "d_mat-burchak-otmas": d_mat_burchak_otmas,
  "d_mat-perimetr-panjara": d_mat_perimetr_panjara,
  "d_mat-yuza-panjara": d_mat_yuza_panjara,
  "d_mat-diagramma-doira": d_mat_diagramma_doira,
  "d_mat-diagramma-chiziq": d_mat_diagramma_chiziq,
  "d_mat-piktogramma": d_mat_piktogramma,
  "d_mat-jadval-bosh": d_mat_jadval_bosh,
  "d_mat-kub-yoyilma": d_mat_kub_yoyilma,
  "d_mat-piramida": d_mat_piramida,
  "d_mat-konus": d_mat_konus,
  "d_mat-parallelepiped": d_mat_parallelepiped,
  "d_mat-romb": d_mat_romb,
  "d_mat-trapetsiya": d_mat_trapetsiya,
  "d_mat-oltiburchak": d_mat_oltiburchak,
  "d_mat-beshburchak": d_mat_beshburchak,
  "d_mat-koordinata": d_mat_koordinata,
  "d_mat-grafik-chiziqli": d_mat_grafik_chiziqli,
  "d_mat-grafik-parabola": d_mat_grafik_parabola,
  "d_mat-tenglama-tarozi": d_mat_tenglama_tarozi,
  "d_mat-aylana-qismlari": d_mat_aylana_qismlari,
  "d_mat-uchburchak-turlari": d_mat_uchburchak_turlari,
  "d_mat-pifagor": d_mat_pifagor,
  "d_mat-prizma": d_mat_prizma,
  "d_mat-silindr-yoyilma": d_mat_silindr_yoyilma,
  "d_mat-vektor": d_mat_vektor,
  "d_mat-venn": d_mat_venn,
  "d_mat-tanga-tashlash": d_mat_tanga_tashlash,
  "d_mat-gistogramma": d_mat_gistogramma,
  "d_mat-masshtab-xarita": d_mat_masshtab_xarita,
  "d_mat-foiz-yuzlik": d_mat_foiz_yuzlik,
  "d_mat-son-toplamlari": d_mat_son_toplamlari,
  "d_mat-tezlik-poyezd": d_mat_tezlik_poyezd,
  "d_mat-hovuz-quvur": d_mat_hovuz_quvur,
  "d_fiz-kuch-itarish": d_fiz_kuch_itarish,
  "d_fiz-kuch-tortish": d_fiz_kuch_tortish,
  "d_fiz-ishqalanish": d_fiz_ishqalanish,
  "d_fiz-ogirlik-kuchi": d_fiz_ogirlik_kuchi,
  "d_fiz-richag": d_fiz_richag,
  "d_fiz-blok": d_fiz_blok,
  "d_fiz-qiya-tekislik": d_fiz_qiya_tekislik,
  "d_fiz-dinamometr": d_fiz_dinamometr,
  "d_fiz-bosim-suv": d_fiz_bosim_suv,
  "d_fiz-arximed": d_fiz_arximed,
  "d_fiz-spidometr": d_fiz_spidometr,
  "d_fiz-energiya-turlari": d_fiz_energiya_turlari,
  "d_fiz-issiqlik-otkazish": d_fiz_issiqlik_otkazish,
  "d_fiz-konveksiya": d_fiz_konveksiya,
  "d_fiz-nurlanish": d_fiz_nurlanish,
  "d_fiz-agregat-holatlar": d_fiz_agregat_holatlar,
  "d_fiz-elektr-zanjir": d_fiz_elektr_zanjir,
  "d_fiz-ketma-ket": d_fiz_ketma_ket,
  "d_fiz-parallel": d_fiz_parallel,
  "d_fiz-magnit-kompas": d_fiz_magnit_kompas,
  "d_fiz-elektromagnit": d_fiz_elektromagnit,
  "d_fiz-tovush-toglqini": d_fiz_tovush_toglqini,
  "d_fiz-yoruglik-sinishi": d_fiz_yoruglik_sinishi,
  "d_fiz-yoruglik-qaytishi": d_fiz_yoruglik_qaytishi,
  "d_fiz-linza": d_fiz_linza,
  "d_fiz-prizma-kamalak": d_fiz_prizma_kamalak,
  "d_fiz-fasllar": d_fiz_fasllar,
  "d_fiz-quyosh-paneli": d_fiz_quyosh_paneli,
  "d_fiz-shamol-generator": d_fiz_shamol_generator,
  "d_fiz-ges": d_fiz_ges,
  "d_fiz-atom-model": d_fiz_atom_model,
  "d_bio-osimlik-qismlari": d_bio_osimlik_qismlari,
  "d_bio-fotosintez": d_bio_fotosintez,
  "d_bio-gul-tuzilishi": d_bio_gul_tuzilishi,
  "d_bio-urug-unishi": d_bio_urug_unishi,
  "d_bio-hujayra-osimlik": d_bio_hujayra_osimlik,
  "d_bio-hujayra-hayvon": d_bio_hujayra_hayvon,
  "d_bio-bakteriya": d_bio_bakteriya,
  "d_bio-zamburug": d_bio_zamburug,
  "d_bio-hasharot-tuzilishi": d_bio_hasharot_tuzilishi,
  "d_bio-baliq-tuzilishi": d_bio_baliq_tuzilishi,
  "d_bio-oziq-zanjiri": d_bio_oziq_zanjiri,
  "d_bio-ekotizim-orman": d_bio_ekotizim_orman,
  "d_bio-ekotizim-chol": d_bio_ekotizim_chol,
  "d_bio-ekotizim-kol": d_bio_ekotizim_kol,
  "d_bio-skelet": d_bio_skelet,
  "d_bio-muskullar": d_bio_muskullar,
  "d_bio-yurak-qon": d_bio_yurak_qon,
  "d_bio-hazm-tizimi": d_bio_hazm_tizimi,
  "d_bio-miya-nerv": d_bio_miya_nerv,
  "d_bio-koz-tuzilishi": d_bio_koz_tuzilishi,
  "d_bio-quloq-tuzilishi": d_bio_quloq_tuzilishi,
  "d_bio-dnk": d_bio_dnk,
  "d_bio-mendel-noxat": d_bio_mendel_noxat,
  "d_bio-ovqat-piramidasi": d_bio_ovqat_piramidasi,
  "d_bio-emlash": d_bio_emlash,
  "d_kim-atom-tuzilishi": d_kim_atom_tuzilishi,
  "d_kim-molekula-suv": d_kim_molekula_suv,
  "d_kim-molekula-co2": d_kim_molekula_co2,
  "d_kim-molekula-o2": d_kim_molekula_o2,
  "d_kim-molekula-metan": d_kim_molekula_metan,
  "d_kim-davriy-jadval": d_kim_davriy_jadval,
  "d_kim-probirka": d_kim_probirka,
  "d_kim-kolba": d_kim_kolba,
  "d_kim-menzurka": d_kim_menzurka,
  "d_kim-spirt-lampa": d_kim_spirt_lampa,
  "d_kim-shtativ": d_kim_shtativ,
  "d_kim-voronka-filtr": d_kim_voronka_filtr,
  "d_kim-pipetka": d_kim_pipetka,
  "d_kim-himoya-kozoynak": d_kim_himoya_kozoynak,
  "d_kim-filtrlash": d_kim_filtrlash,
  "d_kim-buglatish": d_kim_buglatish,
  "d_kim-distillash": d_kim_distillash,
  "d_kim-reaksiya-rang": d_kim_reaksiya_rang,
  "d_kim-reaksiya-gaz": d_kim_reaksiya_gaz,
  "d_kim-reaksiya-chokma": d_kim_reaksiya_chokma,
  "d_kim-lakmus": d_kim_lakmus,
  "d_kim-ph-shkala": d_kim_ph_shkala,
  "d_kim-olov-uchburchagi": d_kim_olov_uchburchagi,
  "d_kim-zanglash": d_kim_zanglash,
  "d_kim-eritma": d_kim_eritma,
  "d_kim-kristall": d_kim_kristall,
  "d_kim-belgi-yonuvchan": d_kim_belgi_yonuvchan,
  "d_kim-belgi-zaharli": d_kim_belgi_zaharli,
  "d_kim-belgi-korroziv": d_kim_belgi_korroziv,
  "d_xb-dokon-chegirma": d_xb_dokon_chegirma,
  "d_xb-avtobus-jadval": d_xb_avtobus_jadval,
  "d_xb-xarita-marshrut": d_xb_xarita_marshrut,
  "d_xb-retsept": d_xb_retsept,
  "d_xb-ob-havo-grafik": d_xb_ob_havo_grafik,
  "d_xb-telefon-tarif": d_xb_telefon_tarif,
  "d_xb-velosiped-safar": d_xb_velosiped_safar,
  "d_xb-bog-maydon": d_xb_bog_maydon,
  "d_xb-suv-sarfi": d_xb_suv_sarfi,
  "d_xb-elektr-hisoblagich": d_xb_elektr_hisoblagich,
  "d_xb-osimlik-tajriba": d_xb_osimlik_tajriba,
  "d_xb-chiqindi-ajratish": d_xb_chiqindi_ajratish,
  "d_xb-yol-belgisi-tezlik": d_xb_yol_belgisi_tezlik,
  "d_xb-kub-qurilma": d_xb_kub_qurilma,
  "d_xb-soya-uzunligi": d_xb_soya_uzunligi,
  "d_xb-tarozida-meva": d_xb_tarozida_meva,
  "d_xb-chipta-navbat": d_xb_chipta_navbat,
  "d_xb-sport-natija": d_xb_sport_natija,
  "d_xb-aholi-diagramma": d_xb_aholi_diagramma,
  "d_xb-tejash-choynak": d_xb_tejash_choynak,
  "d_xb-qor-harorat": d_xb_qor_harorat,
  "d_xb-piramida-kub": d_xb_piramida_kub,
  "d_xb-yoyilma-tanlash": d_xb_yoyilma_tanlash,
  "d_xb-soat-zona": d_xb_soat_zona,
  "d_fiz-yer-oy-quyosh": d_fiz_yer_oy_quyosh,
  "d_m-aeroport": d_m_aeroport,
  "d_m-aksirmoq": d_m_aksirmoq,
  "d_m-angliya": d_m_angliya,
  "d_m-asalli-choy": d_m_asalli_choy,
  "d_m-attraksionlar-bogi": d_m_attraksionlar_bogi,
  "d_m-aytib-berdi": d_m_aytib_berdi,
  "d_m-aytib-berdi-hikoya-qildi": d_m_aytib_berdi_hikoya_qildi,
  "d_m-baland": d_m_baland,
  "d_m-baliq-ovlamoq": d_m_baliq_ovlamoq,
  "d_m-begemot": d_m_begemot,
  "d_m-bel-ogrigi": d_m_bel_ogrigi,
  "d_m-bemor": d_m_bemor,
  "d_m-berlin": d_m_berlin,
  "d_m-beshinchi": d_m_beshinchi,
  "d_m-bir-xil": d_m_bir_xil,
  "d_m-birdan": d_m_birdan,
  "d_m-biz-edik": d_m_biz_edik,
  "d_m-bizning": d_m_bizning,
  "d_m-bolmoq": d_m_bolmoq,
  "d_m-boyinbog": d_m_boyinbog,
  "d_m-borib-keldim-mehmon-boldim": d_m_borib_keldim_mehmon_boldim,
  "d_m-borib-kordi": d_m_borib_kordi,
  "d_m-bosh-ogrigi": d_m_bosh_ogrigi,
  "d_m-boshlandi-boshladi": d_m_boshlandi_boshladi,
  "d_m-boshqacha-farqli": d_m_boshqacha_farqli,
  "d_m-bu-edi": d_m_bu_edi,
  "d_m-chiganoq": d_m_chiganoq,
  "d_m-chiqmoq-kotarilmoq": d_m_chiqmoq_kotarilmoq,
  "d_m-chomilish-kiyimi": d_m_chomilish_kiyimi,
  "d_m-choqqi": d_m_choqqi,
  "d_m-chuqur": d_m_chuqur,
  "d_m-dahshatli-juda-yomon": d_m_dahshatli_juda_yomon,
  "d_m-dala": d_m_dala,
  "d_m-davolamoq": d_m_davolamoq,
  "d_m-dehqon-ayol-fermer": d_m_dehqon_ayol_fermer,
  "d_m-dengiz": d_m_dengiz,
  "d_m-dunyo": d_m_dunyo,
  "d_m-edi": d_m_edi,
  "d_m-edilar": d_m_edilar,
  "d_m-edim-edi": d_m_edim_edi,
  "d_m-eding": d_m_eding,
  "d_m-egizaklar": d_m_egizaklar,
  "d_m-ehtiyot-bol": d_m_ehtiyot_bol,
  "d_m-ehtiyotkor": d_m_ehtiyotkor,
  "d_m-ekdi": d_m_ekdi,
  "d_m-ekdim": d_m_ekdim,
  "d_m-ekmoq": d_m_ekmoq,
  "d_m-emas-edi": d_m_emas_edi,
  "d_m-emas-edilar": d_m_emas_edilar,
  "d_m-eng": d_m_eng,
  "d_m-eng-kam": d_m_eng_kam,
  "d_m-eng-katta": d_m_eng_katta,
  "d_m-eng-kichik": d_m_eng_kichik,
  "d_m-eshak": d_m_eshak,
  "d_m-eshitdi-tingladi": d_m_eshitdi_tingladi,
  "d_m-eslamoq": d_m_eslamoq,
  "d_m-film": d_m_film,
  "d_m-fransuz": d_m_fransuz,
  "d_m-gap-muammo": d_m_gap_muammo,
  "d_m-gaplashdi": d_m_gaplashdi,
  "d_m-gaplashdim": d_m_gaplashdim,
  "d_m-gazli-ichimlik": d_m_gazli_ichimlik,
  "d_m-gepard": d_m_gepard,
  "d_m-hafsalasi-pir-bolgan": d_m_hafsalasi_pir_bolgan,
  "d_m-har-xil": d_m_har_xil,
  "d_m-har-xil-boshqa": d_m_har_xil_boshqa,
  "d_m-har-xil-boshqacha": d_m_har_xil_boshqacha,
  "d_m-harorat-isitma": d_m_harorat_isitma,
  "d_m-hayajonlangan": d_m_hayajonlangan,
  "d_m-hayajonli-asabiy": d_m_hayajonli_asabiy,
  "d_m-hol": d_m_hol,
  "d_m-ichdim": d_m_ichdim,
  "d_m-ikkalasi-ham": d_m_ikkalasi_ham,
  "d_m-ikki-kun-oldin": d_m_ikki_kun_oldin,
  "d_m-ingliz": d_m_ingliz,
  "d_m-ingliz-tili": d_m_ingliz_tili,
  "d_m-ish": d_m_ish,
  "d_m-ishchi": d_m_ishchi,
  "d_m-isitma": d_m_isitma,
  "d_m-isitma-harorat": d_m_isitma_harorat,
  "d_m-jismoniy-mashq": d_m_jismoniy_mashq,
  "d_m-kamar": d_m_kamar,
  "d_m-karkidon": d_m_karkidon,
  "d_m-kasb": d_m_kasb,
  "d_m-kasb-ish": d_m_kasb_ish,
  "d_m-kattaroq": d_m_kattaroq,
  "d_m-kecha": d_m_kecha,
  "d_m-kelmoq": d_m_kelmoq,
  "d_m-keng": d_m_keng,
  "d_m-kerak": d_m_kerak,
  "d_m-kerak-emas": d_m_kerak_emas,
  "d_m-kichikroq": d_m_kichikroq,
  "d_m-kimniki": d_m_kimniki,
  "d_m-kimning": d_m_kimning,
  "d_m-koproq-roq": d_m_koproq_roq,
  "d_m-kotarib-bordi": d_m_kotarib_bordi,
  "d_m-kruassan": d_m_kruassan,
  "d_m-madrid": d_m_madrid,
  "d_m-maktabda": d_m_maktabda,
  "d_m-manzara": d_m_manzara,
  "d_m-marra": d_m_marra,
  "d_m-mehmon-boldi-borib-kordi": d_m_mehmon_boldi_borib_kordi,
  "d_m-men-edim": d_m_men_edim,
  "d_m-meniki": d_m_meniki,
  "d_m-mevali-bog": d_m_mevali_bog,
  "d_m-millat": d_m_millat,
  "d_m-minora": d_m_minora,
  "d_m-moskva": d_m_moskva,
  "d_m-muhandis": d_m_muhandis,
  "d_m-mumkin-emas": d_m_mumkin_emas,
  "d_m-nemis": d_m_nemis,
  "d_m-nimcha-jilet": d_m_nimcha_jilet,
  "d_m-otgan-hafta": d_m_otgan_hafta,
  "d_m-otgan-haftada": d_m_otgan_haftada,
  "d_m-otgan-yil": d_m_otgan_yil,
  "d_m-otgan-yili": d_m_otgan_yili,
  "d_m-otloq": d_m_otloq,
  "d_m-ozbek": d_m_ozbek,
  "d_m-ozbek-tili": d_m_ozbek_tili,
  "d_m-ozbek-ozbek-tili": d_m_ozbek_ozbek_tili,
  "d_m-ozbekcha": d_m_ozbekcha,
  "d_m-ochdim": d_m_ochdim,
  "d_m-ochiq": d_m_ochiq,
  "d_m-ogir": d_m_ogir,
  "d_m-ogrimoq": d_m_ogrimoq,
  "d_m-orol": d_m_orol,
  "d_m-orqa": d_m_orqa,
  "d_m-orqa-bel": d_m_orqa_bel,
  "d_m-oshpaz": d_m_oshpaz,
  "d_m-oshqozon-qorin": d_m_oshqozon_qorin,
  "d_m-oson": d_m_oson,
  "d_m-parij": d_m_parij,
  "d_m-pishirdim": d_m_pishirdim,
  "d_m-piyoda-yurdi-sayr-qildi": d_m_piyoda_yurdi_sayr_qildi,
  "d_m-piyoda-yurdim-sayr-qildim": d_m_piyoda_yurdim_sayr_qildim,
  "d_m-plastir": d_m_plastir,
  "d_m-politsiyachi": d_m_politsiyachi,
  "d_m-poyga": d_m_poyga,
  "d_m-qildi": d_m_qildi,
  "d_m-qiyin": d_m_qiyin,
  "d_m-qoldi": d_m_qoldi,
  "d_m-qoldim": d_m_qoldim,
  "d_m-qorin": d_m_qorin,
  "d_m-qorin-ogrigi": d_m_qorin_ogrigi,
  "d_m-qozogiston": d_m_qozogiston,
  "d_m-qozoq": d_m_qozoq,
  "d_m-qozoq-qozoq-tili": d_m_qozoq_qozoq_tili,
  "d_m-qurmoq": d_m_qurmoq,
  "d_m-quruq": d_m_quruq,
  "d_m-quyon": d_m_quyon,
  "d_m-rossiya": d_m_rossiya,
  "d_m-rus-tili": d_m_rus_tili,
  "d_m-salqin": d_m_salqin,
  "d_m-sandal": d_m_sandal,
  "d_m-sen-eding": d_m_sen_eding,
  "d_m-sen-qilmasliging-kerak": d_m_sen_qilmasliging_kerak,
  "d_m-seniki": d_m_seniki,
  "d_m-shamollash": d_m_shamollash,
  "d_m-shamollash-tumov": d_m_shamollash_tumov,
  "d_m-sharshara": d_m_sharshara,
  "d_m-shifokor": d_m_shifokor,
  "d_m-shimol": d_m_shimol,
  "d_m-shovqinli": d_m_shovqinli,
  "d_m-sizlar-edingiz": d_m_sizlar_edingiz,
  "d_m-sizlarning": d_m_sizlarning,
  "d_m-sizning": d_m_sizning,
  "d_m-sotib-oldi": d_m_sotib_oldi,
  "d_m-sovun-pufagi": d_m_sovun_pufagi,
  "d_m-sugordi": d_m_sugordi,
  "d_m-sugordim": d_m_sugordim,
  "d_m-suv-idishi": d_m_suv_idishi,
  "d_m-sviter": d_m_sviter,
  "d_m-taroq": d_m_taroq,
  "d_m-terdi": d_m_terdi,
  "d_m-terdim-yigdim": d_m_terdim_yigdim,
  "d_m-tingladi": d_m_tingladi,
  "d_m-tingladim": d_m_tingladim,
  "d_m-tish-ogrigi": d_m_tish_ogrigi,
  "d_m-tish-pastasi": d_m_tish_pastasi,
  "d_m-tish-shifokori": d_m_tish_shifokori,
  "d_m-tola": d_m_tola,
  "d_m-tolqin": d_m_tolqin,
  "d_m-toxtadi": d_m_toxtadi,
  "d_m-toglar-tizmasi": d_m_toglar_tizmasi,
  "d_m-tomoq": d_m_tomoq,
  "d_m-tomoq-ogrigi": d_m_tomoq_ogrigi,
  "d_m-topdi": d_m_topdi,
  "d_m-topdim": d_m_topdim,
  "d_m-tozaladi": d_m_tozaladi,
  "d_m-tozaladim": d_m_tozaladim,
  "d_m-tugatdi": d_m_tugatdi,
  "d_m-tugatdim": d_m_tugatdim,
  "d_m-tumanli": d_m_tumanli,
  "d_m-tushlik-qutisi": d_m_tushlik_qutisi,
  "d_m-uchuvchi": d_m_uchuvchi,
  "d_m-ularniki": d_m_ularniki,
  "d_m-ularning": d_m_ularning,
  "d_m-uniki-ularniki": d_m_uniki_ularniki,
  "d_m-uning": d_m_uning,
  "d_m-unutdi": d_m_unutdi,
  "d_m-unutdim": d_m_unutdim,
  "d_m-veterinar": d_m_veterinar,
  "d_m-vodiy": d_m_vodiy,
  "d_m-xalat": d_m_xalat,
  "d_m-xavfli": d_m_xavfli,
  "d_m-xavotirda": d_m_xavotirda,
  "d_m-xavotirli": d_m_xavotirli,
  "d_m-xitoy": d_m_xitoy,
  "d_m-xitoy-tili": d_m_xitoy_tili,
  "d_m-xitoy-xitoy-tili": d_m_xitoy_xitoy_tili,
  "d_m-xitoycha-xitoy": d_m_xitoycha_xitoy,
  "d_m-xuddi-kabi": d_m_xuddi_kabi,
  "d_m-yangilik": d_m_yangilik,
  "d_m-yapon": d_m_yapon,
  "d_m-yapon-tili": d_m_yapon_tili,
  "d_m-yapon-yapon-tili": d_m_yapon_yapon_tili,
  "d_m-yaponiya": d_m_yaponiya,
  "d_m-yaxshiroq": d_m_yaxshiroq,
  "d_m-yengil": d_m_yengil,
  "d_m-yetib-keldim": d_m_yetib_keldim,
  "d_m-yetishtirmoq": d_m_yetishtirmoq,
  "d_m-yetishtirmoq-ostirmoq": d_m_yetishtirmoq_ostirmoq,
  "d_m-yigishtirdi": d_m_yigishtirdi,
  "d_m-yiqildim": d_m_yiqildim,
  "d_m-yiqilmoq": d_m_yiqilmoq,
  "d_m-yotal": d_m_yotal,
  "d_m-yotalmoq": d_m_yotalmoq,
  "d_m-yolgiz": d_m_yolgiz,
  "d_m-yomonroq": d_m_yomonroq,
  "d_m-yomonroq-eng-yomon": d_m_yomonroq_eng_yomon,
  "d_m-yopiq": d_m_yopiq,
  "d_m-yordam-berdi": d_m_yordam_berdi,
  "d_m-yordam-berdim": d_m_yordam_berdim,
  "d_m-yosh": d_m_yosh,
  "d_m-yoshi-katta": d_m_yoshi_katta,
  "d_m-yoshi-kattaroq": d_m_yoshi_kattaroq,
  "d_m-yovvoyi": d_m_yovvoyi,
  "d_m-yozdi": d_m_yozdi,
  "d_m-yozdim": d_m_yozdim,
  "d_m-yozishma-dost": d_m_yozishma_dost,
  "d_m-yozishma-dosti": d_m_yozishma_dosti,
  "d_m-yozuvchi": d_m_yozuvchi,
  "d_m-yuvdi": d_m_yuvdi,
  "d_m-zaif-kuchsiz": d_m_zaif_kuchsiz,
  "d_m-zararli": d_m_zararli,
  "d_m-zararli-nosoglom": d_m_zararli_nosoglom,
  "d_m-bolmoqchiman": d_m_bolmoqchiman,
  "d_m-dan-kamroq": d_m_dan_kamroq,
  "d_m-dan-koproq": d_m_dan_koproq,
  "d_m-dek-kabi": d_m_dek_kabi,
  "d_m-ham-emas": d_m_ham_emas,
  "d_m-qilishing-kerak": d_m_qilishing_kerak,
  "d_m-qilmasliging-kerak": d_m_qilmasliging_kerak,
  "d_m-dan-2": d_m_dan_2,
  "d_m-dan-kelmoq": d_m_dan_kelmoq,
  "d_m-urdi": d_m_urdi,
  "d_m-qatnamoq-borib-kelmoq": d_m_qatnamoq_borib_kelmoq,
  "d_m-adi": d_m_adi,
  "d_m-dimi": d_m_dimi,
  "d_m-madi": d_m_madi,
  "d_m-maydi": d_m_maydi,
  "d_m-moqchi": d_m_moqchi,
  "d_m-dan-keyin": d_m_dan_keyin,
  "d_m-moqchi-bolmoq-rejalashtirmoq": d_m_moqchi_bolmoq_rejalashtirmoq,
  "d_m-achchiq-otkir": d_m_achchiq_otkir,
  "d_m-akrobat-dorboz": d_m_akrobat_dorboz,
  "d_m-aktrisa": d_m_aktrisa,
  "d_m-aktyor": d_m_aktyor,
  "d_m-amin-ishonchim-komil": d_m_amin_ishonchim_komil,
  "d_m-aytdi": d_m_aytdi,
  "d_m-aytdi-aytib-berdi": d_m_aytdi_aytib_berdi,
  "d_m-aytdim": d_m_aytdim,
  "d_m-aytmoq": d_m_aytmoq,
  "d_m-bahona": d_m_bahona,
  "d_m-balandlik": d_m_balandlik,
  "d_m-balki": d_m_balki,
  "d_m-banka": d_m_banka,
  "d_m-baqlajon": d_m_baqlajon,
  "d_m-berdi": d_m_berdi,
  "d_m-bilaguzuk": d_m_bilaguzuk,
  "d_m-biror-narsa": d_m_biror_narsa,
  "d_m-biroz-bir-nechta": d_m_biroz_bir_nechta,
  "d_m-biroz-ozgina": d_m_biroz_ozgina,
  "d_m-boldi-yuz-berdi": d_m_boldi_yuz_berdi,
  "d_m-boldim": d_m_boldim,
  "d_m-boron-momaqaldiroqli-yomgir": d_m_boron_momaqaldiroqli_yomgir,
  "d_m-bojxona": d_m_bojxona,
  "d_m-bor-edi-otkazdi": d_m_bor_edi_otkazdi,
  "d_m-bordi": d_m_bordi,
  "d_m-bordim": d_m_bordim,
  "d_m-boshlanish": d_m_boshlanish,
  "d_m-boy": d_m_boy,
  "d_m-bulochka": d_m_bulochka,
  "d_m-chalmoq": d_m_chalmoq,
  "d_m-chamadon": d_m_chamadon,
  "d_m-chaqmoq": d_m_chaqmoq,
  "d_m-charchatadigan": d_m_charchatadigan,
  "d_m-chet-el-xorijiy": d_m_chet_el_xorijiy,
  "d_m-chet-elda": d_m_chet_elda,
  "d_m-chet-elda-chet-elga": d_m_chet_elda_chet_elga,
  "d_m-chodir-tikib-dam-olmoq": d_m_chodir_tikib_dam_olmoq,
  "d_m-cholgu-asbobi": d_m_cholgu_asbobi,
  "d_m-daraja": d_m_daraja,
  "d_m-daryo": d_m_daryo,
  "d_m-davom-etmoq": d_m_davom_etmoq,
  "d_m-dedi": d_m_dedi,
  "d_m-diqqatga-sazovor-joy": d_m_diqqatga_sazovor_joy,
  "d_m-durang": d_m_durang,
  "d_m-ehtimol": d_m_ehtimol,
  "d_m-ehtimol-katta-ehtimol-bilan": d_m_ehtimol_katta_ehtimol_bilan,
  "d_m-ehtiyot-bolmoq": d_m_ehtiyot_bolmoq,
  "d_m-ekran": d_m_ekran,
  "d_m-ekskursiya-tashrif": d_m_ekskursiya_tashrif,
  "d_m-eng-baland": d_m_eng_baland,
  "d_m-eng-chiroyli": d_m_eng_chiroyli,
  "d_m-eng-gozal": d_m_eng_gozal,
  "d_m-eng-kop-yoqtirib": d_m_eng_kop_yoqtirib,
  "d_m-eng-ogir": d_m_eng_ogir,
  "d_m-eng-tez": d_m_eng_tez,
  "d_m-eng-uzun": d_m_eng_uzun,
  "d_m-eng-yomon": d_m_eng_yomon,
  "d_m-eng-yosh": d_m_eng_yosh,
  "d_m-esdalik-sovga-suvenir": d_m_esdalik_sovga_suvenir,
  "d_m-esdalik-sovgasi": d_m_esdalik_sovgasi,
  "d_m-eslamoq-yodga-olmoq": d_m_eslamoq_yodga_olmoq,
  "d_m-fonar": d_m_fonar,
  "d_m-gramm": d_m_gramm,
  "d_m-gulxan": d_m_gulxan,
  "d_m-gumbaz": d_m_gumbaz,
  "d_m-haddan-tashqari-kop": d_m_haddan_tashqari_kop,
  "d_m-hakam": d_m_hakam,
  "d_m-hamma": d_m_hamma,
  "d_m-hamma-joyda": d_m_hamma_joyda,
  "d_m-haqiqat-rost": d_m_haqiqat_rost,
  "d_m-haykal": d_m_haykal,
  "d_m-haykal-yodgorlik": d_m_haykal_yodgorlik,
  "d_m-hayot": d_m_hayot,
  "d_m-hech-narsa": d_m_hech_narsa,
  "d_m-hech-qancha-biror": d_m_hech_qancha_biror,
  "d_m-hordiq-chiqarmoq": d_m_hordiq_chiqarmoq,
  "d_m-hujumchi": d_m_hujumchi,
  "d_m-indinga": d_m_indinga,
  "d_m-ishonchi-komil": d_m_ishonchi_komil,
  "d_m-ishonchli-aniq": d_m_ishonchli_aniq,
  "d_m-javob-bermoq": d_m_javob_bermoq,
  "d_m-jiyan": d_m_jiyan,
  "d_m-jonab-ketmoq": d_m_jonab_ketmoq,
  "d_m-jonamoq-ketmoq": d_m_jonamoq_ketmoq,
  "d_m-joy-orin": d_m_joy_orin,
  "d_m-kam-oz": d_m_kam_oz,
  "d_m-kassa": d_m_kassa,
  "d_m-kechikish": d_m_kechikish,
  "d_m-kelajak": d_m_kelajak,
  "d_m-kelasi-hafta": d_m_kelasi_hafta,
  "d_m-kelasi-haftada": d_m_kelasi_haftada,
  "d_m-kelin": d_m_kelin,
  "d_m-kesmoq-togramoq": d_m_kesmoq_togramoq,
  "d_m-ketdi-jonadi": d_m_ketdi_jonadi,
  "d_m-keyingi-hafta": d_m_keyingi_hafta,
  "d_m-kim": d_m_kim,
  "d_m-klaviatura": d_m_klaviatura,
  "d_m-korgazma": d_m_korgazma,
  "d_m-kotarib-bormoq": d_m_kotarib_bormoq,
  "d_m-kotarilmoq": d_m_kotarilmoq,
  "d_m-kozboyloqchi-fokuschi": d_m_kozboyloqchi_fokuschi,
  "d_m-kozdan-kechirmoq": d_m_kozdan_kechirmoq,
  "d_m-koala": d_m_koala,
  "d_m-koinot": d_m_koinot,
  "d_m-koinot-kosmos": d_m_koinot_kosmos,
  "d_m-koshin-sirli-gisht": d_m_koshin_sirli_gisht,
  "d_m-kosmonavt": d_m_kosmonavt,
  "d_m-krep": d_m_krep,
  "d_m-kuldi": d_m_kuldi,
  "d_m-kuy": d_m_kuy,
  "d_m-kuy-ohang": d_m_kuy_ohang,
  "d_m-kuyov": d_m_kuyov,
  "d_m-lift": d_m_lift,
  "d_m-litr": d_m_litr,
  "d_m-makkajoxori": d_m_makkajoxori,
  "d_m-manti": d_m_manti,
  "d_m-manzara-korinish": d_m_manzara_korinish,
  "d_m-maqbara": d_m_maqbara,
  "d_m-masxaraboz-kloun": d_m_masxaraboz_kloun,
  "d_m-minora-baland-bino": d_m_minora_baland_bino,
  "d_m-minora-minora-bino": d_m_minora_minora_bino,
  "d_m-minus": d_m_minus,
  "d_m-momaqaldiroqli-boron": d_m_momaqaldiroqli_boron,
  "d_m-momaqaldiroqli-jala": d_m_momaqaldiroqli_jala,
  "d_m-mototsikl": d_m_mototsikl,
  "d_m-muxlis": d_m_muxlis,
  "d_m-muxlis-ishqiboz": d_m_muxlis_ishqiboz,
  "d_m-nega": d_m_nega,
  "d_m-nega-nima-uchun": d_m_nega_nima_uchun,
  "d_m-nevara": d_m_nevara,
  "d_m-noxat": d_m_noxat,
  "d_m-organmoq": d_m_organmoq,
  "d_m-otdi-tugadi": d_m_otdi_tugadi,
  "d_m-ozgarmoq-ozgartirmoq": d_m_ozgarmoq_ozgartirmoq,
  "d_m-ozgartirmoq": d_m_ozgartirmoq,
  "d_m-ob-havo-malumoti": d_m_ob_havo_malumoti,
  "d_m-okean": d_m_okean,
  "d_m-oldi": d_m_oldi,
  "d_m-oldim": d_m_oldim,
  "d_m-olib-kelmoq": d_m_olib_kelmoq,
  "d_m-oltinchi": d_m_oltinchi,
  "d_m-ommabop": d_m_ommabop,
  "d_m-orzu": d_m_orzu,
  "d_m-osma-yol": d_m_osma_yol,
  "d_m-osmonopar-bino": d_m_osmonopar_bino,
  "d_m-oxir-tugash": d_m_oxir_tugash,
  "d_m-oz": d_m_oz,
  "d_m-oz-kam": d_m_oz_kam,
  "d_m-ozgina": d_m_ozgina,
  "d_m-ozgina-biroz": d_m_ozgina_biroz,
  "d_m-parvoz-reys": d_m_parvoz_reys,
  "d_m-pasport": d_m_pasport,
  "d_m-pinyata": d_m_pinyata,
  "d_m-planshet": d_m_planshet,
  "d_m-platforma": d_m_platforma,
  "d_m-platforma-perron": d_m_platforma_perron,
  "d_m-popkorn": d_m_popkorn,
  "d_m-port": d_m_port,
  "d_m-port-bandargoh": d_m_port_bandargoh,
  "d_m-qabulxona": d_m_qabulxona,
  "d_m-qachon": d_m_qachon,
  "d_m-qadoq-quti": d_m_qadoq_quti,
  "d_m-qahramon": d_m_qahramon,
  "d_m-qarindoshlar": d_m_qarindoshlar,
  "d_m-qarzga-bermoq": d_m_qarzga_bermoq,
  "d_m-qatnov-jadvali": d_m_qatnov_jadvali,
  "d_m-qayerga": d_m_qayerga,
  "d_m-qaytarib-bermoq": d_m_qaytarib_bermoq,
  "d_m-qaytib-orqaga": d_m_qaytib_orqaga,
  "d_m-qildi-yasadi": d_m_qildi_yasadi,
  "d_m-qildim-tayyorladim": d_m_qildim_tayyorladim,
  "d_m-qizil-chiroq": d_m_qizil_chiroq,
  "d_m-qizilgoz": d_m_qizilgoz,
  "d_m-qol-chirogi": d_m_qol_chirogi,
  "d_m-qongiroq-qildi": d_m_qongiroq_qildi,
  "d_m-qonmoq": d_m_qonmoq,
  "d_m-qoshiqchi": d_m_qoshiqchi,
  "d_m-qoshmoq": d_m_qoshmoq,
  "d_m-qoy-goshti": d_m_qoy_goshti,
  "d_m-qoydim": d_m_qoydim,
  "d_m-qochib-ketdi": d_m_qochib_ketdi,
  "d_m-qumdan-qasr": d_m_qumdan_qasr,
  "d_m-quti-pachka": d_m_quti_pachka,
  "d_m-quyoshdan-himoya-kremi": d_m_quyoshdan_himoya_kremi,
  "d_m-quyoshdan-saqlovchi-krem": d_m_quyoshdan_saqlovchi_krem,
  "d_m-reja": d_m_reja,
  "d_m-rekord": d_m_rekord,
  "d_m-retsept": d_m_retsept,
  "d_m-reys": d_m_reys,
  "d_m-reys-parvoz": d_m_reys_parvoz,
  "d_m-saroy": d_m_saroy,
  "d_m-sayohat-qilib-joylarni-kormoq": d_m_sayohat_qilib_joylarni_kormoq,
  "d_m-sayohat-qilmoq": d_m_sayohat_qilmoq,
  "d_m-sayohat-safar": d_m_sayohat_safar,
  "d_m-selfi": d_m_selfi,
  "d_m-sevimli-ommabop": d_m_sevimli_ommabop,
  "d_m-shahar-korish-sayr-qilish": d_m_shahar_korish_sayr_qilish,
  "d_m-shampun": d_m_shampun,
  "d_m-shashlik": d_m_shashlik,
  "d_m-shirinlik": d_m_shirinlik,
  "d_m-shor": d_m_shor,
  "d_m-shox": d_m_shox,
  "d_m-sindirdi": d_m_sindirdi,
  "d_m-sindirmoq": d_m_sindirmoq,
  "d_m-singan-buzilgan": d_m_singan_buzilgan,
  "d_m-sirli-maxfiy": d_m_sirli_maxfiy,
  "d_m-skripka": d_m_skripka,
  "d_m-soqmoq-yolak": d_m_soqmoq_yolak,
  "d_m-soradi": d_m_soradi,
  "d_m-soch-chotkasi": d_m_soch_chotkasi,
  "d_m-sovga-qildi": d_m_sovga_qildi,
  "d_m-sovrin": d_m_sovrin,
  "d_m-sovrin-mukofot": d_m_sovrin_mukofot,
  "d_m-soyabon": d_m_soyabon,
  "d_m-sportchi": d_m_sportchi,
  "d_m-suli-botqasi": d_m_suli_botqasi,
  "d_m-suzuvchi-toshak": d_m_suzuvchi_toshak,
  "d_m-tam": d_m_tam,
  "d_m-tanlov": d_m_tanlov,
  "d_m-taom": d_m_taom,
  "d_m-tartib": d_m_tartib,
  "d_m-tartibli-yigishtirilgan": d_m_tartibli_yigishtirilgan,
  "d_m-tatib-kormoq": d_m_tatib_kormoq,
  "d_m-taxmin-qilmoq": d_m_taxmin_qilmoq,
  "d_m-taxtakach": d_m_taxtakach,
  "d_m-termos": d_m_termos,
  "d_m-tez-orada": d_m_tez_orada,
  "d_m-tez-orada-yaqinda": d_m_tez_orada_yaqinda,
  "d_m-tezlik": d_m_tezlik,
  "d_m-togri": d_m_togri,
  "d_m-toy": d_m_toy,
  "d_m-topmoq-bashorat-qilmoq": d_m_topmoq_bashorat_qilmoq,
  "d_m-tovus": d_m_tovus,
  "d_m-tramvay": d_m_tramvay,
  "d_m-tugadi": d_m_tugadi,
  "d_m-tugma": d_m_tugma,
  "d_m-tuxum-qovurma-quymoq": d_m_tuxum_qovurma_quymoq,
  "d_m-uchib-kotarilmoq": d_m_uchib_kotarilmoq,
  "d_m-un": d_m_un,
  "d_m-unutilmas": d_m_unutilmas,
  "d_m-unutmoq": d_m_unutmoq,
  "d_m-urmoq": d_m_urmoq,
  "d_m-uxlab-qolmoq": d_m_uxlab_qolmoq,
  "d_m-uxladi": d_m_uxladi,
  "d_m-uxlash-xaltasi": d_m_uxlash_xaltasi,
  "d_m-uygondi": d_m_uygondi,
  "d_m-vada-bermoq": d_m_vada_bermoq,
  "d_m-vagon": d_m_vagon,
  "d_m-viza": d_m_viza,
  "d_m-vulqon": d_m_vulqon,
  "d_m-xavotirlandi": d_m_xavotirlandi,
  "d_m-xavotirli-tashvishli": d_m_xavotirli_tashvishli,
  "d_m-xotira-esdalik": d_m_xotira_esdalik,
  "d_m-yasadi-tayyorladi": d_m_yasadi_tayyorladi,
  "d_m-yashirincha": d_m_yashirincha,
  "d_m-yaxshiyamki": d_m_yaxshiyamki,
  "d_m-yeb-qoydi": d_m_yeb_qoydi,
  "d_m-yer": d_m_yer,
  "d_m-yetarli": d_m_yetarli,
  "d_m-yetib-keladi": d_m_yetib_keladi,
  "d_m-yetib-keldi": d_m_yetib_keldi,
  "d_m-yetib-kelish": d_m_yetib_kelish,
  "d_m-yigmoq-joylamoq": d_m_yigmoq_joylamoq,
  "d_m-yiqildi": d_m_yiqildi,
  "d_m-yol": d_m_yol,
  "d_m-yodgorlik": d_m_yodgorlik,
  "d_m-yoqilgi-quyish-shoxobchasi": d_m_yoqilgi_quyish_shoxobchasi,
  "d_m-yubormoq": d_m_yubormoq,
  "d_m-yugurdi": d_m_yugurdi,
  "d_m-yutdi": d_m_yutdi,
  "d_m-yutqazdi": d_m_yutqazdi,
  "d_m-zira": d_m_zira,
  "d_m-ziravorlar": d_m_ziravorlar,
  "d_m-kundalik": d_m_kundalik,
  "d_m-almashinuvi": d_m_almashinuvi,
  "d_m-ayotganda-gan-paytda": d_m_ayotganda_gan_paytda,
  "d_m-azo": d_m_azo,
  "d_m-achchiq": d_m_achchiq,
  "d_m-achchiq-ziravorli": d_m_achchiq_ziravorli,
  "d_m-afzal-kormoq": d_m_afzal_kormoq,
  "d_m-afzalroq-koproq-yoqadi": d_m_afzalroq_koproq_yoqadi,
  "d_m-ajratmoq": d_m_ajratmoq,
  "d_m-aksiya-tadbir": d_m_aksiya_tadbir,
  "d_m-aldamoq-kochirmoq": d_m_aldamoq_kochirmoq,
  "d_m-algebra": d_m_algebra,
  "d_m-allaqachon": d_m_allaqachon,
  "d_m-allaqachon-endi": d_m_allaqachon_endi,
  "d_m-allaqachon-hech": d_m_allaqachon_hech,
  "d_m-amerika-tepaligi": d_m_amerika_tepaligi,
  "d_m-anglatmoq-manosi-bolmoq": d_m_anglatmoq_manosi_bolmoq,
  "d_m-asar": d_m_asar,
  "d_m-asr": d_m_asr,
  "d_m-asramoq": d_m_asramoq,
  "d_m-astronom-munajjim": d_m_astronom_munajjim,
  "d_m-atrof-muhit": d_m_atrof_muhit,
  "d_m-axlat": d_m_axlat,
  "d_m-axlat-chelagi": d_m_axlat_chelagi,
  "d_m-axlat-konteyneri": d_m_axlat_konteyneri,
  "d_m-axlat-chiqindi": d_m_axlat_chiqindi,
  "d_m-aynan-shu-paytda": d_m_aynan_shu_paytda,
  "d_m-baho": d_m_baho,
  "d_m-baliqchi": d_m_baliqchi,
  "d_m-begona-odam": d_m_begona_odam,
  "d_m-begona-odam-notanish": d_m_begona_odam_notanish,
  "d_m-belgi-lavha": d_m_belgi_lavha,
  "d_m-belgi-yozuv": d_m_belgi_yozuv,
  "d_m-belgi-yozuvli-taxta": d_m_belgi_yozuvli_taxta,
  "d_m-bergan": d_m_bergan,
  "d_m-bezak": d_m_bezak,
  "d_m-bilim": d_m_bilim,
  "d_m-bint": d_m_bint,
  "d_m-bir-marta": d_m_bir_marta,
  "d_m-bir-marta-ham": d_m_bir_marta_ham,
  "d_m-bir-necha-marta": d_m_bir_necha_marta,
  "d_m-birdan-tosatdan": d_m_birdan_tosatdan,
  "d_m-birinchi-marta": d_m_birinchi_marta,
  "d_m-biror-marta-hech": d_m_biror_marta_hech,
  "d_m-blog": d_m_blog,
  "d_m-boldi-aylandi": d_m_boldi_aylandi,
  "d_m-bolgan": d_m_bolgan,
  "d_m-boron": d_m_boron,
  "d_m-bosh-vaqt": d_m_bosh_vaqt,
  "d_m-bolalik": d_m_bolalik,
  "d_m-boshlovchi": d_m_boshlovchi,
  "d_m-boshpana": d_m_boshpana,
  "d_m-bosmoq": d_m_bosmoq,
  "d_m-buyuk": d_m_buyuk,
  "d_m-buyuk-ipak-yoli": d_m_buyuk_ipak_yoli,
  "d_m-buyum-narsa": d_m_buyum_narsa,
  "d_m-buyurtma-bermoq": d_m_buyurtma_bermoq,
  "d_m-buyurtma-qilmoq-soramoq": d_m_buyurtma_qilmoq_soramoq,
  "d_m-chamadon-yigmoq": d_m_chamadon_yigmoq,
  "d_m-chamadonni-yigmoq": d_m_chamadonni_yigmoq,
  "d_m-chang": d_m_chang,
  "d_m-chang-artmoq": d_m_chang_artmoq,
  "d_m-changyutgich": d_m_changyutgich,
  "d_m-changyutgich-bilan-tozalamoq": d_m_changyutgich_bilan_tozalamoq,
  "d_m-chiqindilar-axlat": d_m_chiqindilar_axlat,
  "d_m-chiqish": d_m_chiqish,
  "d_m-chochib-ketmoq": d_m_chochib_ketmoq,
  "d_m-chop-etmoq": d_m_chop_etmoq,
  "d_m-choy-puli": d_m_choy_puli,
  "d_m-choychaqa": d_m_choychaqa,
  "d_m-dasturxonni-yigishtirmoq": d_m_dasturxonni_yigishtirmoq,
  "d_m-dengizchi": d_m_dengizchi,
  "d_m-desert-shirinlik": d_m_desert_shirinlik,
  "d_m-detektiv-izquvar": d_m_detektiv_izquvar,
  "d_m-detektiv-tergovchi": d_m_detektiv_tergovchi,
  "d_m-donishmand-olim": d_m_donishmand_olim,
  "d_m-doston": d_m_doston,
  "d_m-duxovka": d_m_duxovka,
  "d_m-ekran-oldidagi-vaqt": d_m_ekran_oldidagi_vaqt,
  "d_m-elektr": d_m_elektr,
  "d_m-elektr-toki": d_m_elektr_toki,
  "d_m-energiya": d_m_energiya,
  "d_m-energiya-quvvat": d_m_energiya_quvvat,
  "d_m-eslamoq-esda-tutmoq": d_m_eslamoq_esda_tutmoq,
  "d_m-falokat-fojia": d_m_falokat_fojia,
  "d_m-fan": d_m_fan,
  "d_m-fast-fud-tez-tayyorlanadigan-ovqat": d_m_fast_fud_tez_tayyorlanadigan_ovqat,
  "d_m-fastfud-tez-tayyor-ovqat": d_m_fastfud_tez_tayyor_ovqat,
  "d_m-foiz": d_m_foiz,
  "d_m-foydalanmoq-ishlatmoq": d_m_foydalanmoq_ishlatmoq,
  "d_m-galati": d_m_galati,
  "d_m-gor": d_m_gor,
  "d_m-goyib-bolmoq-yoqolmoq": d_m_goyib_bolmoq_yoqolmoq,
  "d_m-gulchambar-girlyanda": d_m_gulchambar_girlyanda,
  "d_m-gullarga-suv-quymoq": d_m_gullarga_suv_quymoq,
  "d_m-gullarni-sugormoq": d_m_gullarni_sugormoq,
  "d_m-guruh": d_m_guruh,
  "d_m-hali-emas": d_m_hali_emas,
  "d_m-hali-allaqachon": d_m_hali_allaqachon,
  "d_m-hashar-tozalik-kuni": d_m_hashar_tozalik_kuni,
  "d_m-havo": d_m_havo,
  "d_m-havola": d_m_havola,
  "d_m-himoya-qilmoq": d_m_himoya_qilmoq,
  "d_m-himoya-qilmoq-asramoq": d_m_himoya_qilmoq_asramoq,
  "d_m-hisob": d_m_hisob,
  "d_m-hisoblamoq": d_m_hisoblamoq,
  "d_m-hozirgina": d_m_hozirgina,
  "d_m-hozirgina-qilmoq": d_m_hozirgina_qilmoq,
  "d_m-hozirgina-endigina": d_m_hozirgina_endigina,
  "d_m-hukmdor": d_m_hukmdor,
  "d_m-huquqi-bor-ruxsat-bor": d_m_huquqi_bor_ruxsat_bor,
  "d_m-ifloslanish": d_m_ifloslanish,
  "d_m-ikki-marta": d_m_ikki_marta,
  "d_m-internet": d_m_internet,
  "d_m-ipak": d_m_ipak,
  "d_m-iqlim": d_m_iqlim,
  "d_m-ixtiro": d_m_ixtiro,
  "d_m-ixtiro-qildi": d_m_ixtiro_qildi,
  "d_m-ixtiro-qilmoq": d_m_ixtiro_qilmoq,
  "d_m-ixtirochi": d_m_ixtirochi,
  "d_m-iz": d_m_iz,
  "d_m-iz-dalil": d_m_iz_dalil,
  "d_m-izoh-sharh": d_m_izoh_sharh,
  "d_m-jahon-chempioni": d_m_jahon_chempioni,
  "d_m-jiqqa-hol": d_m_jiqqa_hol,
  "d_m-jomrak": d_m_jomrak,
  "d_m-jomrak-kran": d_m_jomrak_kran,
  "d_m-joylamoq-elon-qilmoq": d_m_joylamoq_elon_qilmoq,
  "d_m-joylamoq-qadoqlamoq": d_m_joylamoq_qadoqlamoq,
  "d_m-jurat-qilmoq": d_m_jurat_qilmoq,
  "d_m-jurnalist": d_m_jurnalist,
  "d_m-kanal": d_m_kanal,
  "d_m-karton": d_m_karton,
  "d_m-karvon": d_m_karvon,
  "d_m-kashf-qildi": d_m_kashf_qildi,
  "d_m-kashf-qilmoq": d_m_kashf_qilmoq,
  "d_m-kashfiyotchi-sayyoh-tadqiqotchi": d_m_kashfiyotchi_sayyoh_tadqiqotchi,
  "d_m-kech-qolmoq": d_m_kech_qolmoq,
  "d_m-kerak-emas-mumkin-emas": d_m_kerak_emas_mumkin_emas,
  "d_m-kerak-emas-qilmagan-maqul": d_m_kerak_emas_qilmagan_maqul,
  "d_m-kerak-lozim": d_m_kerak_lozim,
  "d_m-kerak-majbur-bolmoq": d_m_kerak_majbur_bolmoq,
  "d_m-kerak-shart": d_m_kerak_shart,
  "d_m-ketgan": d_m_ketgan,
  "d_m-kir-yuviladigan-kiyim": d_m_kir_yuviladigan_kiyim,
  "d_m-kirish": d_m_kirish,
  "d_m-kirish-joyi": d_m_kirish_joyi,
  "d_m-kishi-odamlar": d_m_kishi_odamlar,
  "d_m-klub-togarak": d_m_klub_togarak,
  "d_m-kochirib-olmoq": d_m_kochirib_olmoq,
  "d_m-kochirmoq": d_m_kochirmoq,
  "d_m-kochirmoq-aldamoq": d_m_kochirmoq_aldamoq,
  "d_m-kokarish": d_m_kokarish,
  "d_m-kongilli": d_m_kongilli,
  "d_m-kop-marta": d_m_kop_marta,
  "d_m-kopchilik": d_m_kopchilik,
  "d_m-kopchilik-aksariyat": d_m_kopchilik_aksariyat,
  "d_m-korsatuv": d_m_korsatuv,
  "d_m-kotarib-olib-bormoq": d_m_kotarib_olib_bormoq,
  "d_m-kolleksiya-toplam": d_m_kolleksiya_toplam,
  "d_m-konteyner": d_m_konteyner,
  "d_m-kubik-tortburchak-bolak": d_m_kubik_tortburchak_bolak,
  "d_m-kulba-kichik-uy": d_m_kulba_kichik_uy,
  "d_m-kundalik-hayot": d_m_kundalik_hayot,
  "d_m-kundalik-tartib-odat": d_m_kundalik_tartib_odat,
  "d_m-kundalik-har-kungi": d_m_kundalik_har_kungi,
  "d_m-lampochka": d_m_lampochka,
  "d_m-lat-yedirmoq-urib-olmoq": d_m_lat_yedirmoq_urib_olmoq,
  "d_m-lat-yemoq-joyini-ogritmoq": d_m_lat_yemoq_joyini_ogritmoq,
  "d_m-lat-yemoq-ogritib-olmoq": d_m_lat_yemoq_ogritib_olmoq,
  "d_m-layk-bosmoq": d_m_layk_bosmoq,
  "d_m-loyiha": d_m_loyiha,
  "d_m-mahsulotlar": d_m_mahsulotlar,
  "d_m-majbur": d_m_majbur,
  "d_m-majbur-bolmoq-kerak": d_m_majbur_bolmoq_kerak,
  "d_m-majburiy": d_m_majburiy,
  "d_m-maktab-formasi": d_m_maktab_formasi,
  "d_m-maktabga-yol": d_m_maktabga_yol,
  "d_m-maqola": d_m_maqola,
  "d_m-marjon-boyinbog": d_m_marjon_boyinbog,
  "d_m-marjon-boyinga-taqiladigan-zanjir": d_m_marjon_boyinga_taqiladigan_zanjir,
  "d_m-marjon-boyinshoda": d_m_marjon_boyinshoda,
  "d_m-marshrutka": d_m_marshrutka,
  "d_m-masala": d_m_masala,
  "d_m-masalliq": d_m_masalliq,
  "d_m-maslahat": d_m_maslahat,
  "d_m-maslahat-bermoq": d_m_maslahat_bermoq,
  "d_m-matbuot": d_m_matbuot,
  "d_m-mehmon-qilmoq-siylamoq": d_m_mehmon_qilmoq_siylamoq,
  "d_m-menyu": d_m_menyu,
  "d_m-menyu-taomnoma": d_m_menyu_taomnoma,
  "d_m-milliy": d_m_milliy,
  "d_m-minib-korgan": d_m_minib_korgan,
  "d_m-minmoq-chiqmoq": d_m_minmoq_chiqmoq,
  "d_m-mol-tovar": d_m_mol_tovar,
  "d_m-mukofot": d_m_mukofot,
  "d_m-mumkin": d_m_mumkin,
  "d_m-munajjim-astronom": d_m_munajjim_astronom,
  "d_m-nafas-olmoq": d_m_nafas_olmoq,
  "d_m-nihoyat-oxiri": d_m_nihoyat_oxiri,
  "d_m-nihoyat-oxirida": d_m_nihoyat_oxirida,
  "d_m-nol": d_m_nol,
  "d_m-notanish-odam": d_m_notanish_odam,
  "d_m-noutbuk": d_m_noutbuk,
  "d_m-novvoy": d_m_novvoy,
  "d_m-ochirmoq": d_m_ochirmoq,
  "d_m-ogirlamoq": d_m_ogirlamoq,
  "d_m-ogri": d_m_ogri,
  "d_m-oquv-fani": d_m_oquv_fani,
  "d_m-osha-paytda": d_m_osha_paytda,
  "d_m-obunachi": d_m_obunachi,
  "d_m-obunachilar": d_m_obunachilar,
  "d_m-odat": d_m_odat,
  "d_m-ofitsiant": d_m_ofitsiant,
  "d_m-ogrimoq-jarohatlamoq": d_m_ogrimoq_jarohatlamoq,
  "d_m-old-tomonda": d_m_old_tomonda,
  "d_m-oldingi-planda": d_m_oldingi_planda,
  "d_m-olim": d_m_olim,
  "d_m-olim-alloma": d_m_olim_alloma,
  "d_m-olimpiya-oyinlari": d_m_olimpiya_oyinlari,
  "d_m-onlayn": d_m_onlayn,
  "d_m-onlayn-internetda": d_m_onlayn_internetda,
  "d_m-onlayn-tarmoqda": d_m_onlayn_tarmoqda,
  "d_m-orqa-planda": d_m_orqa_planda,
  "d_m-orqa-planda-orqada": d_m_orqa_planda_orqada,
  "d_m-orqa-tomonda": d_m_orqa_tomonda,
  "d_m-otda-yurmoq": d_m_otda_yurmoq,
  "d_m-oxirida": d_m_oxirida,
  "d_m-parol": d_m_parol,
  "d_m-pishirmoq": d_m_pishirmoq,
  "d_m-piyoda-sayohat": d_m_piyoda_sayohat,
  "d_m-piyoda-sayr-sayohat": d_m_piyoda_sayr_sayohat,
  "d_m-piyodalar-yolagi": d_m_piyodalar_yolagi,
  "d_m-piyodalar-yolagi-trotuar": d_m_piyodalar_yolagi_trotuar,
  "d_m-plastik": d_m_plastik,
  "d_m-plastmassa-plastik": d_m_plastmassa_plastik,
  "d_m-pled": d_m_pled,
  "d_m-podkast": d_m_podkast,
  "d_m-posilka": d_m_posilka,
  "d_m-post": d_m_post,
  "d_m-qachondir-hech": d_m_qachondir_hech,
  "d_m-qarsildoq": d_m_qarsildoq,
  "d_m-qaynamoq": d_m_qaynamoq,
  "d_m-qaynatib-pishirmoq": d_m_qaynatib_pishirmoq,
  "d_m-qaynatmoq": d_m_qaynatmoq,
  "d_m-qaynatmoq-qaynamoq": d_m_qaynatmoq_qaynamoq,
  "d_m-qayta-foydalanmoq": d_m_qayta_foydalanmoq,
  "d_m-qayta-ishlamoq": d_m_qayta_ishlamoq,
  "d_m-qayta-ishlatmoq": d_m_qayta_ishlatmoq,
  "d_m-qol-silkitmoq": d_m_qol_silkitmoq,
  "d_m-qolyozma": d_m_qolyozma,
  "d_m-qoriqchi": d_m_qoriqchi,
  "d_m-qorqib-ketmoq": d_m_qorqib_ketmoq,
  "d_m-qoida": d_m_qoida,
  "d_m-qoidalar-nizom": d_m_qoidalar_nizom,
  "d_m-qon-oqmoq": d_m_qon_oqmoq,
  "d_m-qopqoq": d_m_qopqoq,
  "d_m-qor-qoploni": d_m_qor_qoploni,
  "d_m-qormoq": d_m_qormoq,
  "d_m-qorovul-soqchi": d_m_qorovul_soqchi,
  "d_m-qoshiq-2": d_m_qoshiq_2,
  "d_m-qovurmoq": d_m_qovurmoq,
  "d_m-qoya": d_m_qoya,
  "d_m-qurib-qolmoq": d_m_qurib_qolmoq,
  "d_m-rasadxona": d_m_rasadxona,
  "d_m-rasmga-tushish-uchun-turmoq": d_m_rasmga_tushish_uchun_turmoq,
  "d_m-repetitsiya": d_m_repetitsiya,
  "d_m-retsept-taom-tayyorlash-usuli": d_m_retsept_taom_tayyorlash_usuli,
  "d_m-ruxsat-etilgan": d_m_ruxsat_etilgan,
  "d_m-sarguzasht": d_m_sarguzasht,
  "d_m-sarlavha": d_m_sarlavha,
  "d_m-savdogar": d_m_savdogar,
  "d_m-sayohatchi-kashfiyotchi": d_m_sayohatchi_kashfiyotchi,
  "d_m-sayyoh-kashfiyotchi": d_m_sayyoh_kashfiyotchi,
  "d_m-sayyoh-tadqiqotchi": d_m_sayyoh_tadqiqotchi,
  "d_m-serial": d_m_serial,
  "d_m-sersuv-shirali": d_m_sersuv_shirali,
  "d_m-shalabbo-hol": d_m_shalabbo_hol,
  "d_m-shart-emas": d_m_shart_emas,
  "d_m-shart-emas-kerak-emas": d_m_shart_emas_kerak_emas,
  "d_m-shart-majbur": d_m_shart_majbur,
  "d_m-shaxsiy": d_m_shaxsiy,
  "d_m-shaxsiy-maxfiy": d_m_shaxsiy_maxfiy,
  "d_m-shaxsiy-yopiq": d_m_shaxsiy_yopiq,
  "d_m-sher": d_m_sher,
  "d_m-shisha-stakan": d_m_shisha_stakan,
  "d_m-shivit": d_m_shivit,
  "d_m-shivit-ukrop": d_m_shivit_ukrop,
  "d_m-shorva-suvi-bulyon": d_m_shorva_suvi_bulyon,
  "d_m-shorva-suvi-qaynatma": d_m_shorva_suvi_qaynatma,
  "d_m-shoir": d_m_shoir,
  "d_m-shu-kunlarda": d_m_shu_kunlarda,
  "d_m-shu-kunlarda-hozirgi-paytda": d_m_shu_kunlarda_hozirgi_paytda,
  "d_m-shugullanmoq": d_m_shugullanmoq,
  "d_m-shundan-keyin": d_m_shundan_keyin,
  "d_m-silkitmoq": d_m_silkitmoq,
  "d_m-sinab-korgan-tatib-korgan": d_m_sinab_korgan_tatib_korgan,
  "d_m-sinab-kormoq-urinmoq": d_m_sinab_kormoq_urinmoq,
  "d_m-sirpanmoq": d_m_sirpanmoq,
  "d_m-songgi-paytlarda": d_m_songgi_paytlarda,
  "d_m-sorovnoma": d_m_sorovnoma,
  "d_m-sodir-bolmoq": d_m_sodir_bolmoq,
  "d_m-sodir-bolmoq-bolmoq": d_m_sodir_bolmoq_bolmoq,
  "d_m-sotib-olgan": d_m_sotib_olgan,
  "d_m-stiker-yopishqoq-rasm": d_m_stiker_yopishqoq_rasm,
  "d_m-suratga-olmoq": d_m_suratga_olmoq,
  "d_m-suratga-tushish-uchun-turmoq": d_m_suratga_tushish_uchun_turmoq,
  "d_m-taassurot": d_m_taassurot,
  "d_m-tabel": d_m_tabel,
  "d_m-tabiat": d_m_tabiat,
  "d_m-taklifnoma": d_m_taklifnoma,
  "d_m-tandir": d_m_tandir,
  "d_m-taqdimot-maruza": d_m_taqdimot_maruza,
  "d_m-taqillatmoq": d_m_taqillatmoq,
  "d_m-taqinchoq": d_m_taqinchoq,
  "d_m-taqiqlangan": d_m_taqiqlangan,
  "d_m-tarjimai-hol": d_m_tarjimai_hol,
  "d_m-tashlab-yubormoq": d_m_tashlab_yubormoq,
  "d_m-tasvirlamoq": d_m_tasvirlamoq,
  "d_m-tatib-kormoq-sinab-kormoq": d_m_tatib_kormoq_sinab_kormoq,
  "d_m-taxir-achchiq": d_m_taxir_achchiq,
  "d_m-tejamoq": d_m_tejamoq,
  "d_m-tejamoq-asramoq": d_m_tejamoq_asramoq,
  "d_m-telekanal": d_m_telekanal,
  "d_m-temir-banka": d_m_temir_banka,
  "d_m-tibbiyot": d_m_tibbiyot,
  "d_m-togramoq": d_m_togramoq,
  "d_m-toplam-kolleksiya": d_m_toplam_kolleksiya,
  "d_m-toplamoq-kolleksiya-qilmoq": d_m_toplamoq_kolleksiya_qilmoq,
  "d_m-tomchilamoq": d_m_tomchilamoq,
  "d_m-tomoshabinlar": d_m_tomoshabinlar,
  "d_m-tormoz-bermoq": d_m_tormoz_bermoq,
  "d_m-tormozlamoq": d_m_tormozlamoq,
  "d_m-tova": d_m_tova,
  "d_m-tozalash": d_m_tozalash,
  "d_m-tozalash-tozalik": d_m_tozalash_tozalik,
  "d_m-tushunmoq": d_m_tushunmoq,
  "d_m-tutun": d_m_tutun,
  "d_m-tuzsiz-tamsiz": d_m_tuzsiz_tamsiz,
  "d_m-uchrashgan-tanishgan": d_m_uchrashgan_tanishgan,
  "d_m-uchratmoq": d_m_uchratmoq,
  "d_m-uloqtirib-tashlamoq": d_m_uloqtirib_tashlamoq,
  "d_m-unib-chiqmoq": d_m_unib_chiqmoq,
  "d_m-uy-ishi-uy-yumushi": d_m_uy_ishi_uy_yumushi,
  "d_m-uy-yumushlari": d_m_uy_yumushlari,
  "d_m-vafot-etdi": d_m_vafot_etdi,
  "d_m-vafot-etmoq": d_m_vafot_etmoq,
  "d_m-vafot-etmoq-olmoq": d_m_vafot_etmoq_olmoq,
  "d_m-vatan-ona-yurt": d_m_vatan_ona_yurt,
  "d_m-vazir": d_m_vazir,
  "d_m-veb-sayt": d_m_veb_sayt,
  "d_m-velosipedchi": d_m_velosipedchi,
  "d_m-video": d_m_video,
  "d_m-xabar": d_m_xabar,
  "d_m-xamir": d_m_xamir,
  "d_m-xavfsiz": d_m_xavfsiz,
  "d_m-xavfsizlik": d_m_xavfsizlik,
  "d_m-xohlamoq-ishtiyoqi-bolmoq": d_m_xohlamoq_ishtiyoqi_bolmoq,
  "d_m-yangiliklar": d_m_yangiliklar,
  "d_m-yaqinda": d_m_yaqinda,
  "d_m-yaqinda-songgi-paytda": d_m_yaqinda_songgi_paytda,
  "d_m-yaqinda-yaqinda-bir-kuni": d_m_yaqinda_yaqinda_bir_kuni,
  "d_m-yarmi": d_m_yarmi,
  "d_m-yaxshilamoq-yaxshilanmoq": d_m_yaxshilamoq_yaxshilanmoq,
  "d_m-yetarli-yetarlicha": d_m_yetarli_yetarlicha,
  "d_m-yettinchi": d_m_yettinchi,
  "d_m-yigmoq-kolleksiya-qilmoq": d_m_yigmoq_kolleksiya_qilmoq,
  "d_m-yigmoq-toplamoq": d_m_yigmoq_toplamoq,
  "d_m-yol-sumkasi": d_m_yol_sumkasi,
  "d_m-yolak-koridor": d_m_yolak_koridor,
  "d_m-yoqolib-ketmoq": d_m_yoqolib_ketmoq,
  "d_m-yoqolmoq-goyib-bolmoq": d_m_yoqolmoq_goyib_bolmoq,
  "d_m-yogli": d_m_yogli,
  "d_m-yomon-kormoq": d_m_yomon_kormoq,
  "d_m-yopishtirmoq": d_m_yopishtirmoq,
  "d_m-yorliq": d_m_yorliq,
  "d_m-yorqin-nimcha-jilet": d_m_yorqin_nimcha_jilet,
  "d_m-yovvoyi-tongiz": d_m_yovvoyi_tongiz,
  "d_m-yozuv-lavha": d_m_yozuv_lavha,
  "d_m-yuborgan": d_m_yuborgan,
  "d_m-yuk-bagaj": d_m_yuk_bagaj,
  "d_m-yuklab-olmoq": d_m_yuklab_olmoq,
  "d_m-zararli-fastfud-ovqat": d_m_zararli_fastfud_ovqat,
  "d_mt34-u6-kechki-ovqat": d_mt34_u6_kechki_ovqat,
  "d_mt34-u6-tunda": d_mt34_u6_tunda,
  "d_mt34-u6-uxlash": d_mt34_u6_uxlash,
  "d_mt34-u7-chap-qol": d_mt34_u7_chap_qol,
  "d_mt34-u7-ong-qol": d_mt34_u7_ong_qol,
  "d_mt34-u8-doira-kvadrat": d_mt34_u8_doira_kvadrat,
  "d_mt34-u8-keyingisi": d_mt34_u8_keyingisi,
  "d_mt34-u8-naqsh-xato": d_mt34_u8_naqsh_xato,
  "d_mt34-u8-naqsh": d_mt34_u8_naqsh,
  "d_mt34-u8-qizil-sariq": d_mt34_u8_qizil_sariq,
  "d_mt34-u8-yashil-kok": d_mt34_u8_yashil_kok,
  "d_mt45-u1-birdan-beshgacha": d_mt45_u1_birdan_beshgacha,
  "d_mt45-u1-bitta-tegamiz": d_mt45_u1_bitta_tegamiz,
  "d_mt45-u1-keyingi": d_mt45_u1_keyingi,
  "d_mt45-u1-oldingi": d_mt45_u1_oldingi,
  "d_mt45-u1-oxirgi-son": d_mt45_u1_oxirgi_son,
  "d_mt45-u1-raqam": d_mt45_u1_raqam,
  "d_mt45-u1-songa-mos": d_mt45_u1_songa_mos,
  "d_mt45-u2-birdan-ongacha": d_mt45_u2_birdan_ongacha,
  "d_mt45-u2-chumoli": d_mt45_u2_chumoli,
  "d_mt45-u2-oltita": d_mt45_u2_oltita,
  "d_mt45-u2-on-barmoq": d_mt45_u2_on_barmoq,
  "d_mt45-u2-teskari": d_mt45_u2_teskari,
  "d_mt45-u3-juftlab": d_mt45_u3_juftlab,
  "d_mt45-u3-kamroq": d_mt45_u3_kamroq,
  "d_mt45-u3-katta-son": d_mt45_u3_katta_son,
  "d_mt45-u3-kichik-son": d_mt45_u3_kichik_son,
  "d_mt45-u3-koproq": d_mt45_u3_koproq,
  "d_mt45-u3-olib-tenglash": d_mt45_u3_olib_tenglash,
  "d_mt45-u3-qoshib-tenglash": d_mt45_u3_qoshib_tenglash,
  "d_mt45-u3-teng": d_mt45_u3_teng,
  "d_mt45-u4-beshinchi": d_mt45_u4_beshinchi,
  "d_mt45-u4-chap-qol": d_mt45_u4_chap_qol,
  "d_mt45-u4-chapdan-ongga": d_mt45_u4_chapdan_ongga,
  "d_mt45-u4-nechanchi": d_mt45_u4_nechanchi,
  "d_mt45-u4-ong-qol": d_mt45_u4_ong_qol,
  "d_mt45-u4-ongda-chapda": d_mt45_u4_ongda_chapda,
  "d_mt45-u4-oxirgi": d_mt45_u4_oxirgi,
  "d_mt45-u4-tortinchi": d_mt45_u4_tortinchi,
  "d_mt45-u4-uchinchi": d_mt45_u4_uchinchi,
  "d_mt45-u5-doira-oval": d_mt45_u5_doira_oval,
  "d_mt45-u5-kvadrat-tortburchak": d_mt45_u5_kvadrat_tortburchak,
  "d_mt45-u5-naqsh-bolagi": d_mt45_u5_naqsh_bolagi,
  "d_mt45-u5-oval-narsalar": d_mt45_u5_oval_narsalar,
  "d_mt45-u5-oval": d_mt45_u5_oval,
  "d_mt45-u5-tortburchak-narsalar": d_mt45_u5_tortburchak_narsalar,
  "d_mt45-u5-tortburchak": d_mt45_u5_tortburchak,
  "d_mt45-u5-uch-naqsh": d_mt45_u5_uch_naqsh,
  "d_mt45-u6-eng-katta": d_mt45_u6_eng_katta,
  "d_mt45-u6-eng-kichik": d_mt45_u6_eng_kichik,
  "d_mt45-u6-eng-qisqa": d_mt45_u6_eng_qisqa,
  "d_mt45-u6-eng-uzun": d_mt45_u6_eng_uzun,
  "d_mt45-u6-kattadan-kichikka": d_mt45_u6_kattadan_kichikka,
  "d_mt45-u6-ortadagisi": d_mt45_u6_ortadagisi,
  "d_mt45-u6-pastdan-balandga": d_mt45_u6_pastdan_balandga,
  "d_mt45-u6-zinapoya": d_mt45_u6_zinapoya,
  "d_mt45-u7-avval-keyin": d_mt45_u7_avval_keyin,
  "d_mt45-u7-kun-tartibi": d_mt45_u7_kun_tartibi,
  "d_mt45-u7-tunda": d_mt45_u7_tunda,
  "d_mt45-u8-barmoqda-hisob": d_mt45_u8_barmoqda_hisob,
  "d_mt45-u8-birga-nechta": d_mt45_u8_birga_nechta,
  "d_mt45-u8-hammasi-ketdi": d_mt45_u8_hammasi_ketdi,
  "d_mt45-u8-hikoya": d_mt45_u8_hikoya,
  "d_mt45-u8-ketdi": d_mt45_u8_ketdi,
  "d_mt45-u8-nechta-qoldi": d_mt45_u8_nechta_qoldi,
  "d_mt45-u8-qoshildi": d_mt45_u8_qoshildi,
  "d_am56-u1-havo": d_am56_u1_havo,
  "d_am56-u1-jonsiz": d_am56_u1_jonsiz,
  "d_am56-u1-odam": d_am56_u1_odam,
  "d_am56-u1-osish": d_am56_u1_osish,
  "d_am56-u1-tirik": d_am56_u1_tirik,
  "d_am56-u2-erish": d_am56_u2_erish,
  "d_am56-u2-idish": d_am56_u2_idish,
  "d_am56-u2-issiqlik": d_am56_u2_issiqlik,
  "d_am56-u2-muzlash": d_am56_u2_muzlash,
  "d_am56-u2-muzlatgich": d_am56_u2_muzlatgich,
  "d_am56-u2-qaynash": d_am56_u2_qaynash,
  "d_am56-u2-qurish": d_am56_u2_qurish,
  "d_am56-u2-suyuq": d_am56_u2_suyuq,
  "d_am56-u2-tomchi": d_am56_u2_tomchi,
  "d_am56-u3-deraza": d_am56_u3_deraza,
  "d_am56-u3-havo2": d_am56_u3_havo2,
  "d_am56-u3-nafas": d_am56_u3_nafas,
  "d_am56-u3-nasos": d_am56_u3_nasos,
  "d_am56-u3-pufak": d_am56_u3_pufak,
  "d_am56-u3-stakan": d_am56_u3_stakan,
  "d_am56-u3-tutun": d_am56_u3_tutun,
  "d_am56-u3-yelkan": d_am56_u3_yelkan,
  "d_am56-u4-hilol": d_am56_u4_hilol,
  "d_am56-u4-kunduz": d_am56_u4_kunduz,
  "d_am56-u4-shapka": d_am56_u4_shapka,
  "d_am56-u4-uyqu": d_am56_u4_uyqu,
  "d_am56-u5-ayiq": d_am56_u5_ayiq,
  "d_am56-u5-chumchuq": d_am56_u5_chumchuq,
  "d_am56-u5-otxor": d_am56_u5_otxor,
  "d_am56-u5-yirtqich": d_am56_u5_yirtqich,
  "d_am56-u5-zanjir": d_am56_u5_zanjir,
  "d_am56-u6-boyqush": d_am56_u6_boyqush,
  "d_am56-u6-echki": d_am56_u6_echki,
  "d_am56-u7-banka": d_am56_u7_banka,
  "d_mt23-u1-kopdan-bitta": d_mt23_u1_kopdan_bitta,
  "d_mt23-u1-tola": d_mt23_u1_tola,
  "d_mt23-u2-daraxt-nihol": d_mt23_u2_daraxt_nihol,
  "d_mt23-u2-katta-ayiq": d_mt23_u2_katta_ayiq,
  "d_mt23-u2-katta-ordak": d_mt23_u2_katta_ordak,
  "d_mt23-u2-kichik-ayiqcha": d_mt23_u2_kichik_ayiqcha,
  "d_mt23-u2-kichik-ordakcha": d_mt23_u2_kichik_ordakcha,
  "d_mt23-u2-tarvuz-olcha": d_mt23_u2_tarvuz_olcha,
  "d_mt23-u3-bir-xil": d_mt23_u3_bir_xil,
  "d_mt23-u3-juft": d_mt23_u3_juft,
  "d_mt23-u3-mushuk-mushukcha": d_mt23_u3_mushuk_mushukcha,
  "d_mt23-u3-poyabzal-jufti": d_mt23_u3_poyabzal_jufti,
  "d_mt23-u3-qolqop-jufti": d_mt23_u3_qolqop_jufti,
  "d_mt23-u3-tovuq-joja": d_mt23_u3_tovuq_joja,
  "d_mt23-u4-bir-xil-rang": d_mt23_u4_bir_xil_rang,
  "d_mt23-u4-terish": d_mt23_u4_terish,
  "d_mt23-u5-doira-dumalaydi": d_mt23_u5_doira_dumalaydi,
  "d_mt23-u5-doira": d_mt23_u5_doira,
  "d_mt23-u5-dumaloq": d_mt23_u5_dumaloq,
  "d_mt23-u5-kvadrat-dumalamaydi": d_mt23_u5_kvadrat_dumalamaydi,
  "d_mt23-u5-kvadrat-narsalar": d_mt23_u5_kvadrat_narsalar,
  "d_mt23-u6-qisqa-dum": d_mt23_u6_qisqa_dum,
  "d_mt23-u6-qisqa-poyezd": d_mt23_u6_qisqa_poyezd,
  "d_mt23-u6-qisqa": d_mt23_u6_qisqa,
  "d_mt23-u6-uzun-boyin": d_mt23_u6_uzun_boyin,
  "d_mt23-u6-uzun-poyezd": d_mt23_u6_uzun_poyezd,
  "d_mt23-u7-daraxt-tagida": d_mt23_u7_daraxt_tagida,
  "d_mt23-u7-daraxt-tepasida": d_mt23_u7_daraxt_tepasida,
  "d_mt23-u7-pastga": d_mt23_u7_pastga,
  "d_mt23-u7-tepada": d_mt23_u7_tepada,
  "d_mt23-u7-tepaga": d_mt23_u7_tepaga,
  "d_mt23-u8-savat-ichida": d_mt23_u8_savat_ichida,
  "d_mt23-u8-savatdan-tashqarida": d_mt23_u8_savatdan_tashqarida,
  "d_mt23-u8-tashqarida": d_mt23_u8_tashqarida,
  "d_mt23-u8-uy-ichida": d_mt23_u8_uy_ichida,
  "d_mt23-u8-uydan-tashqarida": d_mt23_u8_uydan_tashqarida,
  "d_mt34-u1-barmoq-sanash": d_mt34_u1_barmoq_sanash,
  "d_mt34-u1-bitta": d_mt34_u1_bitta,
  "d_mt34-u1-ikkita": d_mt34_u1_ikkita,
  "d_mt34-u1-ikkitadan": d_mt34_u1_ikkitadan,
  "d_mt34-u1-oxirgi-son": d_mt34_u1_oxirgi_son,
  "d_mt34-u1-uchta-ayiq": d_mt34_u1_uchta_ayiq,
  "d_mt34-u1-uchta": d_mt34_u1_uchta,
  "d_mt34-u2-barmoqda": d_mt34_u2_barmoqda,
  "d_mt34-u2-beshta-barmoq": d_mt34_u2_beshta_barmoq,
  "d_mt34-u2-beshta": d_mt34_u2_beshta,
  "d_mt34-u2-keyingi-son": d_mt34_u2_keyingi_son,
  "d_mt34-u2-sanoq-qatori": d_mt34_u2_sanoq_qatori,
  "d_mt34-u2-songa-mos": d_mt34_u2_songa_mos,
  "d_mt34-u2-tort-oyoq": d_mt34_u2_tort_oyoq,
  "d_mt34-u2-tortta": d_mt34_u2_tortta,
  "d_mt34-u3-bitta-qoshamiz": d_mt34_u3_bitta_qoshamiz,
  "d_mt34-u3-bittasini-olamiz": d_mt34_u3_bittasini_olamiz,
  "d_mt34-u3-juftlash": d_mt34_u3_juftlash,
  "d_mt34-u3-ortib-qoldi": d_mt34_u3_ortib_qoldi,
  "d_mt34-u3-teng-emas": d_mt34_u3_teng_emas,
  "d_mt34-u3-teng": d_mt34_u3_teng,
  "d_mt34-u4-burchak-yoq": d_mt34_u4_burchak_yoq,
  "d_mt34-u4-doira": d_mt34_u4_doira,
  "d_mt34-u4-shakldan-uy": d_mt34_u4_shakldan_uy,
  "d_mt34-u4-shakliga-terish": d_mt34_u4_shakliga_terish,
  "d_mt34-u4-tortta-burchak": d_mt34_u4_tortta_burchak,
  "d_mt34-u4-uchburchak-narsalar": d_mt34_u4_uchburchak_narsalar,
  "d_mt34-u4-uchta-burchak": d_mt34_u4_uchta_burchak,
  "d_am34-u5-barg-tokilishi": d_am34_u5_barg_tokilishi,
  "d_am34-u5-hosil": d_am34_u5_hosil,
  "d_am34-u6-romashka": d_am34_u6_romashka,
  "d_am34-u6-sugorish": d_am34_u6_sugorish,
  "d_am34-u7-rels": d_am34_u7_rels,
  "d_am34-u8-qozon": d_am34_u8_qozon,
  "d_am34-u8-yolovchi": d_am34_u8_yolovchi,
  "d_am45-u1-aylana": d_am45_u1_aylana,
  "d_am45-u1-barglar-tokiladi": d_am45_u1_barglar_tokiladi,
  "d_am45-u1-fasl-kiyimi": d_am45_u1_fasl_kiyimi,
  "d_am45-u1-kun-qisqaradi": d_am45_u1_kun_qisqaradi,
  "d_am45-u1-kurtaklar": d_am45_u1_kurtaklar,
  "d_am45-u1-mevalar-pishadi": d_am45_u1_mevalar_pishadi,
  "d_am45-u1-qor-yogadi": d_am45_u1_qor_yogadi,
  "d_am45-u1-qushlar-ketadi": d_am45_u1_qushlar_ketadi,
  "d_am45-u1-qushlar-qaytadi": d_am45_u1_qushlar_qaytadi,
  "d_am45-u1-uzun-kun": d_am45_u1_uzun_kun,
  "d_am45-u2-havo": d_am45_u2_havo,
  "d_am45-u2-ildiz": d_am45_u2_ildiz,
  "d_am45-u2-kundalik": d_am45_u2_kundalik,
  "d_am45-u2-kuzatish": d_am45_u2_kuzatish,
  "d_am45-u2-meva-urugi": d_am45_u2_meva_urugi,
  "d_am45-u3-gul-shirasi": d_am45_u3_gul_shirasi,
  "d_am45-u3-olti-oyoq": d_am45_u3_olti_oyoq,
  "d_am45-u4-eshitish": d_am45_u4_eshitish,
  "d_am45-u4-foydali-ovqat": d_am45_u4_foydali_ovqat,
  "d_am45-u4-hid-bilish": d_am45_u4_hid_bilish,
  "d_am45-u4-korish": d_am45_u4_korish,
  "d_am45-u4-nafas": d_am45_u4_nafas,
  "d_am45-u4-qol-yuvish": d_am45_u4_qol_yuvish,
  "d_am45-u4-tam-bilish": d_am45_u4_tam_bilish,
  "d_am45-u4-teri": d_am45_u4_teri,
  "d_am45-u4-uyqu": d_am45_u4_uyqu,
  "d_am45-u4-yurak": d_am45_u4_yurak,
  "d_am45-u5-tarbiyachi": d_am45_u5_tarbiyachi,
  "d_am45-u5-yelkanli-qayiq": d_am45_u5_yelkanli_qayiq,
  "d_en45-u5-sister": d_en45_u5_sister,
  "d_en45-u5-this-is-my": d_en45_u5_this_is_my,
  "d_en45-u6-clap-your-hands": d_en45_u6_clap_your_hands,
  "d_en45-u6-ears": d_en45_u6_ears,
  "d_en45-u6-eyes": d_en45_u6_eyes,
  "d_en45-u6-fingers": d_en45_u6_fingers,
  "d_en45-u6-hands": d_en45_u6_hands,
  "d_en45-u6-head": d_en45_u6_head,
  "d_en45-u6-knees": d_en45_u6_knees,
  "d_en45-u6-legs": d_en45_u6_legs,
  "d_en45-u6-mouth": d_en45_u6_mouth,
  "d_en45-u6-nose": d_en45_u6_nose,
  "d_en45-u6-shoulders": d_en45_u6_shoulders,
  "d_en45-u6-stamp-your-feet": d_en45_u6_stamp_your_feet,
  "d_en45-u6-toes": d_en45_u6_toes,
  "d_en45-u6-touch-your-nose": d_en45_u6_touch_your_nose,
  "d_en45-u7-apple": d_en45_u7_apple,
  "d_en45-u7-banana": d_en45_u7_banana,
  "d_en45-u7-carrot": d_en45_u7_carrot,
  "d_en45-u7-cucumber": d_en45_u7_cucumber,
  "d_en45-u7-grapes": d_en45_u7_grapes,
  "d_en45-u7-i-like": d_en45_u7_i_like,
  "d_en45-u7-lemon": d_en45_u7_lemon,
  "d_en45-u7-orange-fruit": d_en45_u7_orange_fruit,
  "d_en45-u7-potato": d_en45_u7_potato,
  "d_en45-u7-strawberry": d_en45_u7_strawberry,
  "d_en45-u7-tomato": d_en45_u7_tomato,
  "d_en45-u7-yummy": d_en45_u7_yummy,
  "d_en45-u8-ball": d_en45_u8_ball,
  "d_en45-u8-doll": d_en45_u8_doll,
  "d_en45-u8-dress": d_en45_u8_dress,
  "d_en45-u8-hat": d_en45_u8_hat,
  "d_en45-u8-i-like-my-teddy": d_en45_u8_i_like_my_teddy,
  "d_en45-u8-its-a-ball": d_en45_u8_its_a_ball,
  "d_en45-u8-kite": d_en45_u8_kite,
  "d_en45-u8-robot": d_en45_u8_robot,
  "d_en45-u8-shoes": d_en45_u8_shoes,
  "d_en45-u8-socks": d_en45_u8_socks,
  "d_en45-u8-t-shirt": d_en45_u8_t_shirt,
  "d_en45-u8-trousers": d_en45_u8_trousers,
  "d_en45-u8-what-is-it": d_en45_u8_what_is_it,
  "d_en56-s4-breakfast": d_en56_s4_breakfast,
  "d_en56-s5-find-the-kitten": d_en56_s5_find_the_kitten,
  "d_en56-s6-park-weather": d_en56_s6_park_weather,
  "d_en56-u4-bread": d_en56_u4_bread,
  "d_en56-u4-cake": d_en56_u4_cake,
  "d_en56-u4-cheese": d_en56_u4_cheese,
  "d_en56-u4-chicken": d_en56_u4_chicken,
  "d_en56-u4-egg": d_en56_u4_egg,
  "d_en56-u4-ice-cream": d_en56_u4_ice_cream,
  "d_en56-u4-im-hungry": d_en56_u4_im_hungry,
  "d_en56-u4-im-thirsty": d_en56_u4_im_thirsty,
  "d_en56-u4-juice": d_en56_u4_juice,
  "d_en56-u4-milk": d_en56_u4_milk,
  "d_en56-u4-rice": d_en56_u4_rice,
  "d_en56-u4-soup": d_en56_u4_soup,
  "d_en56-u4-sweets": d_en56_u4_sweets,
  "d_en56-u4-tea": d_en56_u4_tea,
  "d_en56-u4-water": d_en56_u4_water,
  "d_en56-u4-yummy": d_en56_u4_yummy,
  "d_en56-u5-bathroom": d_en56_u5_bathroom,
  "d_en56-u5-bedroom": d_en56_u5_bedroom,
  "d_en56-u5-chair": d_en56_u5_chair,
  "d_en56-u5-clock": d_en56_u5_clock,
  "d_en56-u5-door": d_en56_u5_door,
  "d_en56-u5-garden": d_en56_u5_garden,
  "d_en56-u5-house": d_en56_u5_house,
  "d_en56-u5-in-box": d_en56_u5_in_box,
  "d_en56-u5-kitchen": d_en56_u5_kitchen,
  "d_en56-u5-lamp": d_en56_u5_lamp,
  "d_en56-u5-living-room": d_en56_u5_living_room,
  "d_en56-u5-on-table": d_en56_u5_on_table,
  "d_en56-u5-tv": d_en56_u5_tv,
  "d_en56-u5-under-bed": d_en56_u5_under_bed,
  "d_en56-u5-where-cat": d_en56_u5_where_cat,
  "d_en56-u5-window": d_en56_u5_window,
  "d_en56-u6-autumn": d_en56_u6_autumn,
  "d_en56-u6-cloudy": d_en56_u6_cloudy,
  "d_en56-u6-cold": d_en56_u6_cold,
  "d_en56-u6-hot": d_en56_u6_hot,
  "d_en56-u6-rainbow": d_en56_u6_rainbow,
  "d_en56-u6-rainy": d_en56_u6_rainy,
  "d_en56-u6-snowman": d_en56_u6_snowman,
  "d_en56-u6-snowy": d_en56_u6_snowy,
  "d_en56-u6-spring": d_en56_u6_spring,
  "d_en56-u6-summer": d_en56_u6_summer,
  "d_en56-u6-sunny": d_en56_u6_sunny,
  "d_en56-u6-umbrella": d_en56_u6_umbrella,
  "d_en56-u6-weather": d_en56_u6_weather,
  "d_en56-u6-windy": d_en56_u6_windy,
  "d_en56-u6-winter": d_en56_u6_winter,
  "d_en56-u8-i-am-happy": d_en56_u8_i_am_happy,
  "d_en67-u7-here-you-are": d_en67_u7_here_you_are,
  "d_en67-u7-youre-welcome": d_en67_u7_youre_welcome,
  "d_mt34-u5-balandroq": d_mt34_u5_balandroq,
  "d_mt34-u5-pastroq": d_mt34_u5_pastroq,
  "d_mt34-u5-qisqa": d_mt34_u5_qisqa,
  "d_mt34-u5-qisqaroq": d_mt34_u5_qisqaroq,
  "d_mt34-u5-uzunroq": d_mt34_u5_uzunroq,
  "d_mt34-u6-bogchaga": d_mt34_u6_bogchaga,
  "d_am45-u6-kirpi": d_am45_u6_kirpi,
  "d_am45-u6-oq-quyon": d_am45_u6_oq_quyon,
  "d_am45-u6-qush-uychasi": d_am45_u6_qush_uychasi,
  "d_am45-u6-yem": d_am45_u6_yem,
  "d_am45-u6-zaxira": d_am45_u6_zaxira,
  "d_am45-u7-dush": d_am45_u7_dush,
  "d_am45-u7-gulga-suv": d_am45_u7_gulga_suv,
  "d_am45-u7-jomrak": d_am45_u7_jomrak,
  "d_am45-u7-tomchi": d_am45_u7_tomchi,
  "d_am45-u8-101": d_am45_u8_101,
  "d_am45-u8-begona": d_am45_u8_begona,
  "d_am45-u8-maydoncha": d_am45_u8_maydoncha,
  "d_am45-u8-ota-onaga": d_am45_u8_ota_onaga,
  "d_am45-u8-qizil": d_am45_u8_qizil,
  "d_am45-u8-qol-ushlab": d_am45_u8_qol_ushlab,
  "d_am45-u8-sariq": d_am45_u8_sariq,
  "d_am45-u8-yashil": d_am45_u8_yashil,
  "d_am45-u8-yoq-deymiz": d_am45_u8_yoq_deymiz,
  "d_am45-u8-zebra": d_am45_u8_zebra,
  "d_en45-s1-new-friend": d_en45_s1_new_friend,
  "d_en45-s15-kindergarten-lunch": d_en45_s15_kindergarten_lunch,
  "d_en45-s16-morning-ready": d_en45_s16_morning_ready,
  "d_en45-s17-slide-turns": d_en45_s17_slide_turns,
  "d_en45-s2-painting-rainbow": d_en45_s2_painting_rainbow,
  "d_en45-s3-park-ducks": d_en45_s3_park_ducks,
  "d_en45-s4-zoo-granny": d_en45_s4_zoo_granny,
  "d_en45-s5-visiting-grandma": d_en45_s5_visiting_grandma,
  "d_en45-s6-morning-exercises": d_en45_s6_morning_exercises,
  "d_en45-s7-fruit-market": d_en45_s7_fruit_market,
  "d_en45-s8-dressing-for-park": d_en45_s8_dressing_for_park,
  "d_en45-u1-blue": d_en45_u1_blue,
  "d_en45-u1-good-morning": d_en45_u1_good_morning,
  "d_en45-u1-goodbye": d_en45_u1_goodbye,
  "d_en45-u1-green": d_en45_u1_green,
  "d_en45-u1-hello": d_en45_u1_hello,
  "d_en45-u1-how-are-you": d_en45_u1_how_are_you,
  "d_en45-u1-im-fine": d_en45_u1_im_fine,
  "d_en45-u1-my-name-is": d_en45_u1_my_name_is,
  "d_en45-u1-red": d_en45_u1_red,
  "d_en45-u1-thank-you": d_en45_u1_thank_you,
  "d_en45-u1-whats-your-name": d_en45_u1_whats_your_name,
  "d_en45-u1-yellow": d_en45_u1_yellow,
  "d_en45-u12-can-i-have-a-ball-please": d_en45_u12_can_i_have_a_ball_please,
  "d_en45-u12-excuse-me": d_en45_u12_excuse_me,
  "d_en45-u12-no-thank-you": d_en45_u12_no_thank_you,
  "d_en45-u12-thats-ok": d_en45_u12_thats_ok,
  "d_en45-u12-yes-please": d_en45_u12_yes_please,
  "d_en45-u13-bag": d_en45_u13_bag,
  "d_en45-u13-bath": d_en45_u13_bath,
  "d_en45-u13-breakfast": d_en45_u13_breakfast,
  "d_en45-u13-dinner": d_en45_u13_dinner,
  "d_en45-u13-go-to-bed": d_en45_u13_go_to_bed,
  "d_en45-u13-i-go-to-kindergarten": d_en45_u13_i_go_to_kindergarten,
  "d_en45-u13-lets-go": d_en45_u13_lets_go,
  "d_en45-u13-wake-up": d_en45_u13_wake_up,
  "d_en45-u14-angry": d_en45_u14_angry,
  "d_en45-u14-be-my-friend": d_en45_u14_be_my_friend,
  "d_en45-u14-how-do-you-feel": d_en45_u14_how_do_you_feel,
  "d_en45-u14-lets-play-together": d_en45_u14_lets_play_together,
  "d_en45-u14-my-turn": d_en45_u14_my_turn,
  "d_en45-u14-your-turn": d_en45_u14_your_turn,
  "d_en45-u2-black": d_en45_u2_black,
  "d_en45-u2-brown": d_en45_u2_brown,
  "d_en45-u2-grey": d_en45_u2_grey,
  "d_en45-u2-orange-color": d_en45_u2_orange_color,
  "d_en45-u2-pink": d_en45_u2_pink,
  "d_en45-u2-purple": d_en45_u2_purple,
  "d_en45-u2-rainbow": d_en45_u2_rainbow,
  "d_en45-u2-what-colour": d_en45_u2_what_colour,
  "d_en45-u2-white": d_en45_u2_white,
  "d_en45-u3-eight": d_en45_u3_eight,
  "d_en45-u3-five": d_en45_u3_five,
  "d_en45-u3-four": d_en45_u3_four,
  "d_en45-u3-how-many": d_en45_u3_how_many,
  "d_en45-u3-nine": d_en45_u3_nine,
  "d_en45-u3-one": d_en45_u3_one,
  "d_en45-u3-seven": d_en45_u3_seven,
  "d_en45-u3-six": d_en45_u3_six,
  "d_en45-u3-ten": d_en45_u3_ten,
  "d_en45-u3-three": d_en45_u3_three,
  "d_en45-u3-two": d_en45_u3_two,
  "d_en45-u4-bear": d_en45_u4_bear,
  "d_en45-u4-crocodile": d_en45_u4_crocodile,
  "d_en45-u4-elephant": d_en45_u4_elephant,
  "d_en45-u4-fox": d_en45_u4_fox,
  "d_en45-u4-giraffe": d_en45_u4_giraffe,
  "d_en45-u4-lion": d_en45_u4_lion,
  "d_en45-u4-monkey": d_en45_u4_monkey,
  "d_en45-u4-owl": d_en45_u4_owl,
  "d_en45-u4-snake": d_en45_u4_snake,
  "d_en45-u4-tiger": d_en45_u4_tiger,
  "d_en45-u4-wolf": d_en45_u4_wolf,
  "d_en45-u4-zebra": d_en45_u4_zebra,
  "d_en45-u5-baby": d_en45_u5_baby,
  "d_en45-u5-brother": d_en45_u5_brother,
  "d_en45-u5-family": d_en45_u5_family,
  "d_en45-u5-father": d_en45_u5_father,
  "d_en45-u5-grandma": d_en45_u5_grandma,
  "d_en45-u5-grandpa": d_en45_u5_grandpa,
  "d_en45-u5-mother": d_en45_u5_mother,
  "d_am23-u1-baliqcha": d_am23_u1_baliqcha,
  "d_am23-u1-it": d_am23_u1_it,
  "d_am23-u6-qordan-odam": d_am23_u6_qordan_odam,
  "d_am23-u7-piyola": d_am23_u7_piyola,
  "d_am23-u8-qol": d_am23_u8_qol,
  "d_am23-u8-quloq": d_am23_u8_quloq,
  "d_am23-u8-toza-qollar": d_am23_u8_toza_qollar,
  "d_am23-u8-vanna": d_am23_u8_vanna,
  "d_am34-u1-buzoq": d_am34_u1_buzoq,
  "d_am34-u1-kuchukcha": d_am34_u1_kuchukcha,
  "d_am34-u1-qozichoq": d_am34_u1_qozichoq,
  "d_am34-u1-toychoq": d_am34_u1_toychoq,
  "d_am34-u1-yovvoyi-hayvon": d_am34_u1_yovvoyi_hayvon,
  "d_am34-u2-boyqush": d_am34_u2_boyqush,
  "d_am34-u2-chumchuq": d_am34_u2_chumchuq,
  "d_am34-u2-kabutar": d_am34_u2_kabutar,
  "d_am34-u4-bulutli": d_am34_u4_bulutli,
  "d_am34-u4-issiq": d_am34_u4_issiq,
  "d_am34-u4-kurtka": d_am34_u4_kurtka,
  "d_am34-u4-quyoshli": d_am34_u4_quyoshli,
  "d_am34-u4-sovuq": d_am34_u4_sovuq,
  "d_en23-u10-clap": d_en23_u10_clap,
  "d_en23-u10-dance": d_en23_u10_dance,
  "d_en23-u10-jump": d_en23_u10_jump,
  "d_en23-u10-run": d_en23_u10_run,
  "d_en23-u11-happy": d_en23_u11_happy,
  "d_en23-u11-please": d_en23_u11_please,
  "d_en23-u11-sad": d_en23_u11_sad,
  "d_en23-u11-sorry": d_en23_u11_sorry,
  "d_en23-u9-bed": d_en23_u9_bed,
  "d_en23-u9-brush-your-teeth": d_en23_u9_brush_your_teeth,
  "d_en23-u9-drink": d_en23_u9_drink,
  "d_en23-u9-eat": d_en23_u9_eat,
  "d_en23-u9-sleep": d_en23_u9_sleep,
  "d_en23-u9-wash-your-hands": d_en23_u9_wash_your_hands,
  "d_en34-u1-bye": d_en34_u1_bye,
  "d_en34-u1-good-morning": d_en34_u1_good_morning,
  "d_en34-u1-good-night": d_en34_u1_good_night,
  "d_en34-u1-hello": d_en34_u1_hello,
  "d_en34-u1-hi": d_en34_u1_hi,
  "d_en34-u1-no": d_en34_u1_no,
  "d_en34-u1-thank-you": d_en34_u1_thank_you,
  "d_en34-u1-yes": d_en34_u1_yes,
  "d_en34-u2-baby": d_en34_u2_baby,
  "d_en34-u2-boy": d_en34_u2_boy,
  "d_en34-u2-dad": d_en34_u2_dad,
  "d_en34-u2-family": d_en34_u2_family,
  "d_en34-u2-girl": d_en34_u2_girl,
  "d_en34-u2-grandpa": d_en34_u2_grandpa,
  "d_en34-u2-granny": d_en34_u2_granny,
  "d_en34-u2-mum": d_en34_u2_mum,
  "d_en34-u3-black": d_en34_u3_black,
  "d_en34-u3-blue": d_en34_u3_blue,
  "d_en34-u3-green": d_en34_u3_green,
  "d_en34-u3-orange": d_en34_u3_orange,
  "d_en34-u3-pink": d_en34_u3_pink,
  "d_en34-u3-red": d_en34_u3_red,
  "d_en34-u3-white": d_en34_u3_white,
  "d_en34-u3-yellow": d_en34_u3_yellow,
  "d_en34-u4-cat": d_en34_u4_cat,
  "d_en34-u4-cow": d_en34_u4_cow,
  "d_en34-u4-dog": d_en34_u4_dog,
  "d_en34-u4-duck": d_en34_u4_duck,
  "d_en34-u4-hen": d_en34_u4_hen,
  "d_en34-u4-horse": d_en34_u4_horse,
  "d_en34-u4-rabbit": d_en34_u4_rabbit,
  "d_en34-u4-sheep": d_en34_u4_sheep,
  "d_en34-u5-big": d_en34_u5_big,
  "d_en34-u5-five": d_en34_u5_five,
  "d_en34-u5-four": d_en34_u5_four,
  "d_en34-u5-one": d_en34_u5_one,
  "d_en34-u5-small": d_en34_u5_small,
  "d_en34-u5-three": d_en34_u5_three,
  "d_en34-u5-two": d_en34_u5_two,
  "d_en34-u6-ball": d_en34_u6_ball,
  "d_en34-u6-balloon": d_en34_u6_balloon,
  "d_en34-u6-blocks": d_en34_u6_blocks,
  "d_en34-u6-car": d_en34_u6_car,
  "d_en34-u6-doll": d_en34_u6_doll,
  "d_en34-u6-drum": d_en34_u6_drum,
  "d_en34-u6-teddy": d_en34_u6_teddy,
  "d_en34-u6-train": d_en34_u6_train,
  "d_en34-u7-ears": d_en34_u7_ears,
  "d_en34-u7-eyes": d_en34_u7_eyes,
  "d_en34-u7-feet": d_en34_u7_feet,
  "d_en34-u7-hands": d_en34_u7_hands,
  "d_en34-u7-head": d_en34_u7_head,
  "d_en34-u7-legs": d_en34_u7_legs,
  "d_en34-u7-mouth": d_en34_u7_mouth,
  "d_en34-u7-nose": d_en34_u7_nose,
  "d_en34-u8-apple": d_en34_u8_apple,
  "d_en34-u8-banana": d_en34_u8_banana,
  "d_en34-u8-bread": d_en34_u8_bread,
  "d_en34-u8-cake": d_en34_u8_cake,
  "d_en34-u8-juice": d_en34_u8_juice,
  "d_en34-u8-milk": d_en34_u8_milk,
  "d_en34-u8-water": d_en34_u8_water,
  "d_en34-u8-yummy": d_en34_u8_yummy,
  "d_mt23-u1-bitta": d_mt23_u1_bitta,
  "d_mt23-u1-bittadan": d_mt23_u1_bittadan,
  "d_am56-u7-gul": d_am56_u7_gul,
  "d_am56-u7-kochat": d_am56_u7_kochat,
  "d_am56-u7-kompost": d_am56_u7_kompost,
  "d_am56-u7-plastik2": d_am56_u7_plastik2,
  "d_am56-u7-qayta": d_am56_u7_qayta,
  "d_am56-u7-qogoz": d_am56_u7_qogoz,
  "d_am56-u7-qushlar": d_am56_u7_qushlar,
  "d_am56-u7-shisha": d_am56_u7_shisha,
  "d_am56-u7-tozalik": d_am56_u7_tozalik,
  "d_am56-u8-bog": d_am56_u8_bog,
  "d_am56-u8-manzil": d_am56_u8_manzil,
  "d_am56-u8-qoshni": d_am56_u8_qoshni,
  "d_am56-u8-sotuvchi": d_am56_u8_sotuvchi,
  "d_am67-u1-aylanish": d_am67_u1_aylanish,
  "d_am67-u1-bug": d_am67_u1_bug,
  "d_am67-u1-buglanish": d_am67_u1_buglanish,
  "d_am67-u1-dengiz": d_am67_u1_dengiz,
  "d_am67-u1-sovish": d_am67_u1_sovish,
  "d_am67-u2-kunduz": d_am67_u2_kunduz,
  "d_am67-u2-nur": d_am67_u2_nur,
  "d_am67-u2-oq": d_am67_u2_oq,
  "d_am67-u2-orbita": d_am67_u2_orbita,
  "d_am67-u2-qiyalik": d_am67_u2_qiyalik,
  "d_am67-u2-yer": d_am67_u2_yer,
  "d_am67-u3-asalari": d_am67_u3_asalari,
  "d_am67-u3-ildiz": d_am67_u3_ildiz,
  "d_am67-u3-intilish": d_am67_u3_intilish,
  "d_am67-u3-poya": d_am67_u3_poya,
  "d_am67-u3-shimish": d_am67_u3_shimish,
  "d_am67-u3-solish": d_am67_u3_solish,
  "d_am67-u3-sugorish": d_am67_u3_sugorish,
  "d_am67-u3-unish": d_am67_u3_unish,
  "d_am67-u3-yashil": d_am67_u3_yashil,
  "d_am67-u3-yoruglik": d_am67_u3_yoruglik,
  "d_am67-u4-ayiq": d_am67_u4_ayiq,
  "d_am67-u4-bugu": d_am67_u4_bugu,
  "d_am67-u4-echkemar": d_am67_u4_echkemar,
  "d_am67-u4-jayron": d_am67_u4_jayron,
  "d_am67-u4-kamyob": d_am67_u4_kamyob,
  "d_am67-u4-laylak": d_am67_u4_laylak,
  "d_am67-u4-morxor": d_am67_u4_morxor,
  "d_am67-u4-qizilkitob": d_am67_u4_qizilkitob,
  "d_am67-u4-qoriqxona": d_am67_u4_qoriqxona,
  "d_am67-u4-toqay": d_am67_u4_toqay,
  "d_am67-u4-yordam": d_am67_u4_yordam,
  "d_am67-u5-chelak": d_am67_u5_chelak,
  "d_am67-u5-chiroq": d_am67_u5_chiroq,
  "d_am67-u5-dush": d_am67_u5_dush,
  "d_am67-u5-ichimlik": d_am67_u5_ichimlik,
  "d_am67-u5-panel": d_am67_u5_panel,
  "d_am67-u5-rozetka": d_am67_u5_rozetka,
  "d_am67-u5-stansiya": d_am67_u5_stansiya,
  "d_am67-u5-televizor": d_am67_u5_televizor,
  "d_am67-u5-tish": d_am67_u5_tish,
  "d_am67-u5-tomchi": d_am67_u5_tomchi,
  "d_am67-u5-tozalash": d_am67_u5_tozalash,
  "d_am67-u6-daryolar": d_am67_u6_daryolar,
  "d_am67-u6-ipakyoli": d_am67_u6_ipakyoli,
  "d_am67-u6-qizilqum": d_am67_u6_qizilqum,
  "d_am67-u6-toglar": d_am67_u6_toglar,
  "d_am67-u6-toshkent": d_am67_u6_toshkent,
  "d_am67-u6-xiva": d_am67_u6_xiva,
  "d_am67-u7-foydali": d_am67_u7_foydali,
  "d_am67-u7-nafas": d_am67_u7_nafas,
  "d_am67-u7-oshqozon": d_am67_u7_oshqozon,
  "d_am67-u7-puls": d_am67_u7_puls,
  "d_am67-u7-qon": d_am67_u7_qon,
  "d_am67-u7-quloq": d_am67_u7_quloq,
  "d_am67-u7-tish": d_am67_u7_tish,
  "d_am67-u7-tozahavo": d_am67_u7_tozahavo,
  "d_am67-u7-yurak": d_am67_u7_yurak,
  "d_am67-u8-aks": d_am67_u8_aks,
  "d_am67-u8-fonar": d_am67_u8_fonar,
  "d_am67-u8-qisqich": d_am67_u8_qisqich,
  "d_am67-u8-ranglar": d_am67_u8_ranglar,
  "d_am67-u8-teatr": d_am67_u8_teatr,
  "d_am67-u8-tomchinur": d_am67_u8_tomchinur,
  "d_am67-u8-zaychik": d_am67_u8_zaychik,
  "d_en56-s7-market": d_en56_s7_market,
  "d_en56-s8-birthday-party": d_en56_s8_birthday_party,
  "d_en56-u7-dislike-onions": d_en56_u7_dislike_onions,
  "d_en56-u7-dislike-rain": d_en56_u7_dislike_rain,
  "d_en56-u7-dislike-spiders": d_en56_u7_dislike_spiders,
  "d_en56-u7-do-you-like": d_en56_u7_do_you_like,
  "d_en56-u7-favourite-colour": d_en56_u7_favourite_colour,
  "d_en56-u7-favourite-toy": d_en56_u7_favourite_toy,
  "d_en56-u7-like-apples": d_en56_u7_like_apples,
  "d_en56-u7-like-cats": d_en56_u7_like_cats,
  "d_en56-u7-like-ice-cream": d_en56_u7_like_ice_cream,
  "d_en56-u7-love-mum": d_en56_u7_love_mum,
  "d_en56-u7-no-i-dont": d_en56_u7_no_i_dont,
  "d_en56-u7-yes-i-do": d_en56_u7_yes_i_do,
  "d_en56-u8-can-clap": d_en56_u8_can_clap,
  "d_en56-u8-can-dance": d_en56_u8_can_dance,
  "d_en56-u8-can-draw": d_en56_u8_can_draw,
  "d_en56-u8-can-jump": d_en56_u8_can_jump,
  "d_en56-u8-can-run": d_en56_u8_can_run,
  "d_en56-u8-can-sing": d_en56_u8_can_sing,
  "d_en56-u8-can-swim": d_en56_u8_can_swim,
  "d_en56-u8-cant-fly": d_en56_u8_cant_fly,
  "d_v-1-ta-doira": d_v_1_ta_doira,
  "d_v-1-ta": d_v_1_ta,
  "d_v-2-qadam": d_v_2_qadam,
  "d_v-2-ta": d_v_2_ta,
  "d_v-4-qadam": d_v_4_qadam,
  "d_v-4-ta-doira": d_v_4_ta_doira,
  "d_v-4-ta": d_v_4_ta,
  "d_v-a-comb": d_v_a_comb,
  "d_v-aniq-belgidan": d_v_aniq_belgidan,
  "d_v-aniq-bilganlarimizni": d_v_aniq_bilganlarimizni,
  "d_v-artinamiz": d_v_artinamiz,
  "d_v-artinishga": d_v_artinishga,
  "d_v-artish": d_v_artish,
  "d_v-aylanib": d_v_aylanib,
  "d_v-barmoq-bilan-kuzatib": d_v_barmoq_bilan_kuzatib,
  "d_v-bazi": d_v_bazi,
  "d_v-bir-qarab": d_v_bir_qarab,
  "d_v-bir-xil": d_v_bir_xil,
  "d_v-biri-ogir": d_v_biri_ogir,
  "d_v-boshida": d_v_boshida,
  "d_v-bright": d_v_bright,
  "d_v-bugdoydan": d_v_bugdoydan,
  "d_v-burchakli": d_v_burchakli,
  "d_v-can-be-seen": d_v_can_be_seen,
  "d_v-chap-kabi": d_v_chap_kabi,
  "d_v-chap-va-ongga-qaraymiz": d_v_chap_va_ongga_qaraymiz,
  "d_v-chiqarib-tashlaymiz": d_v_chiqarib_tashlaymiz,
  "d_v-chiroyli-shapka-uchun": d_v_chiroyli_shapka_uchun,
  "d_v-chtoby-est": d_v_chtoby_est,
  "d_v-dadam": d_v_dadam,
  "d_v-dadamniki": d_v_dadamniki,
  "d_v-devordan-sakraymiz": d_v_devordan_sakraymiz,
  "d_v-diqqat-bilan-qaraymiz": d_v_diqqat_bilan_qaraymiz,
  "d_v-disappears": d_v_disappears,
  "d_v-dlya-sveta": d_v_dlya_sveta,
  "d_v-dry": d_v_dry,
  "d_v-drying": d_v_drying,
  "d_v-dumaloq": d_v_dumaloq,
  "d_v-eng-tepada": d_v_eng_tepada,
  "d_v-eriydi": d_v_eriydi,
  "d_v-est": d_v_est,
  "d_v-flower-juice": d_v_flower_juice,
  "d_v-gul-shirasidan": d_v_gul_shirasidan,
  "d_v-hamma": d_v_hamma,
  "d_v-hammasi-teng": d_v_hammasi_teng,
  "d_v-har-xil": d_v_har_xil,
  "d_v-havo": d_v_havo,
  "d_v-hech-kim": d_v_hech_kim,
  "d_v-hech-kimniki": d_v_hech_kimniki,
  "d_v-hech-narsa": d_v_hech_narsa,
  "d_v-hech-narsani": d_v_hech_narsani,
  "d_v-hovlida": d_v_hovlida,
  "d_v-ikki-marta": d_v_ikki_marta,
  "d_v-in-a-barn": d_v_in_a_barn,
  "d_v-in-a-kennel": d_v_in_a_kennel,
  "d_v-in-the-dark": d_v_in_the_dark,
  "d_v-in-the-light": d_v_in_the_light,
  "d_v-in-water-and-on-the-shore": d_v_in_water_and_on_the_shore,
  "d_v-it-is-not-fruit": d_v_it_is_not_fruit,
  "d_v-iz-soka-tsvetov": d_v_iz_soka_tsvetov,
  "d_v-joyi": d_v_joyi,
  "d_v-juft": d_v_juft,
  "d_v-kam": d_v_kam,
  "d_v-kamayadi": d_v_kamayadi,
  "d_v-katta-qizil": d_v_katta_qizil,
  "d_v-katta-yashil": d_v_katta_yashil,
  "d_v-kattalashadi": d_v_kattalashadi,
  "d_v-kattaligida": d_v_kattaligida,
  "d_v-kecha": d_v_kecha,
  "d_v-kichik-kok": d_v_kichik_kok,
  "d_v-kichik-qizil": d_v_kichik_qizil,
  "d_v-kiyamiz": d_v_kiyamiz,
  "d_v-kopayadi": d_v_kopayadi,
  "d_v-korinadi": d_v_korinadi,
  "d_v-kotariladi": d_v_kotariladi,
  "d_v-koz-yumib": d_v_koz_yumib,
  "d_v-kozni-yumamiz": d_v_kozni_yumamiz,
  "d_v-krysha": d_v_krysha,
  "d_v-kunduzi-oyinda": d_v_kunduzi_oyinda,
  "d_v-kuzda": d_v_kuzda,
  "d_v-kvadrat-yoki-tortburchak": d_v_kvadrat_yoki_tortburchak,
  "d_v-look-carefully": d_v_look_carefully,
  "d_v-meniki": d_v_meniki,
  "d_v-mesto": d_v_mesto,
  "d_v-meva-emas": d_v_meva_emas,
  "d_v-meva-turi": d_v_meva_turi,
  "d_v-molxonada": d_v_molxonada,
  "d_v-muzlatgichda": d_v_muzlatgichda,
  "d_v-muzlaydi": d_v_muzlaydi,
  "d_v-na-nogu": d_v_na_nogu,
  "d_v-na-ruku": d_v_na_ruku,
  "d_v-na-svetu": d_v_na_svetu,
  "d_v-nadevaem": d_v_nadevaem,
  "d_v-narsaning-ishiga": d_v_narsaning_ishiga,
  "d_v-ne-frukt": d_v_ne_frukt,
  "d_v-net-smeshno": d_v_net_smeshno,
  "d_v-net-tolko-tyomnaya": d_v_net_tolko_tyomnaya,
  "d_v-nichego": d_v_nichego,
  "d_v-nothing": d_v_nothing,
  "d_v-notogri": d_v_notogri,
  "d_v-novvoy": d_v_novvoy,
  "d_v-ogirligi-teng": d_v_ogirligi_teng,
  "d_v-ogriydi": d_v_ogriydi,
  "d_v-olcham": d_v_olcham,
  "d_v-oldingda": d_v_oldingda,
  "d_v-olma-yoqoldi": d_v_olma_yoqoldi,
  "d_v-olmadan": d_v_olmadan,
  "d_v-on-the-foot": d_v_on_the_foot,
  "d_v-on-the-hand": d_v_on_the_hand,
  "d_v-oq-qora": d_v_oq_qora,
  "d_v-orqaga-qaytamiz": d_v_orqaga_qaytamiz,
  "d_v-orqaga-yotamiz": d_v_orqaga_yotamiz,
  "d_v-orqangda": d_v_orqangda,
  "d_v-ortada": d_v_ortada,
  "d_v-osadi": d_v_osadi,
  "d_v-osha-tomon-kop": d_v_osha_tomon_kop,
  "d_v-osib-ketadi": d_v_osib_ketadi,
  "d_v-oson-topamiz": d_v_oson_topamiz,
  "d_v-otamiz": d_v_otamiz,
  "d_v-ovoz": d_v_ovoz,
  "d_v-ovqat-va-suv": d_v_ovqat_va_suv,
  "d_v-ovqat-yeyishga": d_v_ovqat_yeyishga,
  "d_v-ovqat-yeymiz": d_v_ovqat_yeymiz,
  "d_v-oxirgi-meva": d_v_oxirgi_meva,
  "d_v-oxirida": d_v_oxirida,
  "d_v-oynashga": d_v_oynashga,
  "d_v-oyoqqa": d_v_oyoqqa,
  "d_v-ozgarmaydi": d_v_ozgarmaydi,
  "d_v-ozim": d_v_ozim,
  "d_v-pastga-tushadi": d_v_pastga_tushadi,
  "d_v-posmeyomsya": d_v_posmeyomsya,
  "d_v-propadaet": d_v_propadaet,
  "d_v-qadamini-sanab": d_v_qadamini_sanab,
  "d_v-qaynaydi": d_v_qaynaydi,
  "d_v-qismma-qism": d_v_qismma_qism,
  "d_v-qiyshayadi": d_v_qiyshayadi,
  "d_v-qoidani": d_v_qoidani,
  "d_v-qolga": d_v_qolga,
  "d_v-qolgan-odamniki": d_v_qolgan_odamniki,
  "d_v-qoqilishga": d_v_qoqilishga,
  "d_v-qorongida": d_v_qorongida,
  "d_v-qoshiqqa": d_v_qoshiqqa,
  "d_v-qumdan": d_v_qumdan,
  "d_v-quruq": d_v_quruq,
  "d_v-quyoshda": d_v_quyoshda,
  "d_v-rangida": d_v_rangida,
  "d_v-rangiga-qarab": d_v_rangiga_qarab,
  "d_v-rangiga": d_v_rangiga,
  "d_v-rangni": d_v_rangni,
  "d_v-raschyoskoy": d_v_raschyoskoy,
  "d_v-sababini": d_v_sababini,
  "d_v-sariq-qizil": d_v_sariq_qizil,
  "d_v-seshanba": d_v_seshanba,
  "d_v-shakl": d_v_shakl,
  "d_v-shanba": d_v_shanba,
  "d_v-shippak": d_v_shippak,
  "d_v-slippers": d_v_slippers,
  "d_v-soglom-bolsin": d_v_soglom_bolsin,
  "d_v-soliydi": d_v_soliydi,
  "d_v-stakan": d_v_stakan,
  "d_v-suhaya": d_v_suhaya,
  "d_v-suvda-va-qirgoqda": d_v_suvda_va_qirgoqda,
  "d_v-suvdan-tashqarida": d_v_suvdan_tashqarida,
  "d_v-svetlaya": d_v_svetlaya,
  "d_v-tanlaymiz": d_v_tanlaymiz,
  "d_v-tarog-bilan": d_v_tarog_bilan,
  "d_v-tashqarida": d_v_tashqarida,
  "d_v-tasodifiylarni": d_v_tasodifiylarni,
  "d_v-taxmindan": d_v_taxmindan,
  "d_v-teng-emas": d_v_teng_emas,
  "d_v-teng-turadi": d_v_teng_turadi,
  "d_v-teng": d_v_teng,
  "d_v-tepa": d_v_tepa,
  "d_v-tepada": d_v_tepada,
  "d_v-tepaga-chiqadi": d_v_tepaga_chiqadi,
  "d_v-the-apple-disappeared": d_v_the_apple_disappeared,
  "d_v-togri-tortburchak": d_v_togri_tortburchak,
  "d_v-togri": d_v_togri,
  "d_v-tola": d_v_tola,
  "d_v-tortburchak": d_v_tortburchak,
  "d_v-toxtab-oylaymiz": d_v_toxtab_oylaymiz,
  "d_v-toxtaymiz": d_v_toxtaymiz,
  "d_v-tuxumda": d_v_tuxumda,
  "d_v-uchib-ketadi": d_v_uchib_ketadi,
  "d_v-uchinchi": d_v_uchinchi,
  "d_v-undan": d_v_undan,
  "d_v-ustidan-sakrab-yiqilib": d_v_ustidan_sakrab_yiqilib,
  "d_v-uychada": d_v_uychada,
  "d_v-uyning-ichidasan": d_v_uyning_ichidasan,
  "d_v-uyning-tashqarisidasan": d_v_uyning_tashqarisidasan,
  "d_v-v-budke": d_v_v_budke,
  "d_v-v-korovnike": d_v_v_korovnike,
  "d_v-v-tapochkah": d_v_v_tapochkah,
  "d_v-v-temnote": d_v_v_temnote,
  "d_v-v-vode-i-na-beregu": d_v_v_vode_i_na_beregu,
  "d_v-vidno": d_v_vidno,
  "d_v-vnimatelno-smotret": d_v_vnimatelno_smotret,
  "d_v-vytiraemsya": d_v_vytiraemsya,
  "d_v-vytirat": d_v_vytirat,
  "d_v-vytiratsya": d_v_vytiratsya,
  "d_v-we-dry": d_v_we_dry,
  "d_v-wear-it": d_v_wear_it,
  "d_v-yabloko-propalo": d_v_yabloko_propalo,
  "d_v-yangi-barg-chiqadi": d_v_yangi_barg_chiqadi,
  "d_v-yashnaydi": d_v_yashnaydi,
  "d_v-yer-osti": d_v_yer_osti,
  "d_v-yer-ostida": d_v_yer_ostida,
  "d_v-yer": d_v_yer,
  "d_v-yeyish-uchun": d_v_yeyish_uchun,
  "d_v-yeyish": d_v_yeyish,
  "d_v-yomgirdan-keyin": d_v_yomgirdan_keyin,
  "d_v-yon-tomonga-buriliamiz": d_v_yon_tomonga_buriliamiz,
  "d_v-yoq-bitta": d_v_yoq_bitta,
  "d_v-yoq-faqat-qora": d_v_yoq_faqat_qora,
  "d_v-yoq-kulgili": d_v_yoq_kulgili,
  "d_v-yoq-olchash-kerak": d_v_yoq_olchash_kerak,
  "d_v-yoq-pingvin-uchmaydi": d_v_yoq_pingvin_uchmaydi,
  "d_v-yoqoladi": d_v_yoqoladi,
  "d_v-yoruglik-uchun": d_v_yoruglik_uchun,
  "d_v-yotqizsa-ha": d_v_yotqizsa_ha,
  "d_v-yovvoyi-hayvon": d_v_yovvoyi_hayvon,
  "d_v-yovvoyi": d_v_yovvoyi,
  "d_v-yuqori-va-past-orasida": d_v_yuqori_va_past_orasida,
  "d_v-yuqori": d_v_yuqori,
  "d_v-zakryto": d_v_zakryto,
  "d_mt67-u3-came-plus": d_mt67_u3_came_plus,
  "d_mt67-u3-check": d_mt67_u3_check,
  "d_mt67-u3-count-back-sub": d_mt67_u3_count_back_sub,
  "d_mt67-u3-from-ten": d_mt67_u3_from_ten,
  "d_mt67-u3-left-minus": d_mt67_u3_left_minus,
  "d_mt67-u3-minus-all": d_mt67_u3_minus_all,
  "d_mt67-u3-minus-one": d_mt67_u3_minus_one,
  "d_mt67-u3-minus": d_mt67_u3_minus,
  "d_mt67-u3-taking-away": d_mt67_u3_taking_away,
  "d_mt67-u4-altogether": d_mt67_u4_altogether,
  "d_mt67-u4-ate": d_mt67_u4_ate,
  "d_mt67-u4-check-answer": d_mt67_u4_check_answer,
  "d_mt67-u4-condition": d_mt67_u4_condition,
  "d_mt67-u4-how-many-left": d_mt67_u4_how_many_left,
  "d_mt67-u4-make-problem": d_mt67_u4_make_problem,
  "d_mt67-u4-more-came": d_mt67_u4_more_came,
  "d_mt67-u4-question": d_mt67_u4_question,
  "d_mt67-u4-story-from-sum": d_mt67_u4_story_from_sum,
  "d_mt67-u5-corner-side": d_mt67_u5_corner_side,
  "d_mt67-u5-equal-parts": d_mt67_u5_equal_parts,
  "d_mt67-u5-four-quarters": d_mt67_u5_four_quarters,
  "d_mt67-u5-hexagon": d_mt67_u5_hexagon,
  "d_mt67-u5-pentagon": d_mt67_u5_pentagon,
  "d_mt67-u5-rectangle": d_mt67_u5_rectangle,
  "d_mt67-u5-whole": d_mt67_u5_whole,
  "d_mt67-u6-autumn-months": d_mt67_u6_autumn_months,
  "d_mt67-u6-clock-face": d_mt67_u6_clock_face,
  "d_mt67-u6-eight-oclock": d_mt67_u6_eight_oclock,
  "d_mt67-u6-hour-hand": d_mt67_u6_hour_hand,
  "d_mt67-u6-minute-hand": d_mt67_u6_minute_hand,
  "d_mt67-u6-oclock": d_mt67_u6_oclock,
  "d_mt67-u6-spring-months": d_mt67_u6_spring_months,
  "d_mt67-u6-summer-months": d_mt67_u6_summer_months,
  "d_mt67-u6-three-oclock": d_mt67_u6_three_oclock,
  "d_mt67-u6-winter-months": d_mt67_u6_winter_months,
  "d_mt67-u7-cell": d_mt67_u7_cell,
  "d_mt67-u7-change": d_mt67_u7_change,
  "d_mt67-u7-coin-100": d_mt67_u7_coin_100,
  "d_mt67-u7-coin-200-500": d_mt67_u7_coin_200_500,
  "d_mt67-u7-graphic-dictation": d_mt67_u7_graphic_dictation,
  "d_mt67-u7-grid-direction": d_mt67_u7_grid_direction,
  "d_mt67-u7-grid-pattern": d_mt67_u7_grid_pattern,
  "d_mt67-u7-hands-side": d_mt67_u7_hands_side,
  "d_mt67-u7-pay": d_mt67_u7_pay,
  "d_mt67-u8-cause": d_mt67_u8_cause,
  "d_mt67-u8-count-by-two": d_mt67_u8_count_by_two,
  "d_mt67-u8-count-master": d_mt67_u8_count_master,
  "d_mt67-u8-effect": d_mt67_u8_effect,
  "d_mt67-u8-growing": d_mt67_u8_growing,
  "d_mt67-u8-last": d_mt67_u8_last,
  "d_mt67-u8-math-master": d_mt67_u8_math_master,
  "d_mt67-u8-rule": d_mt67_u8_rule,
  "d_mt67-u8-school-bag": d_mt67_u8_school_bag,
  "d_mt67-u8-second-third": d_mt67_u8_second_third,
  "d_mt67-u8-sequence": d_mt67_u8_sequence,
  "d_m-boshqotirma": d_m_boshqotirma,
  "d_m-dost": d_m_dost,
  "d_m-mazali": d_m_mazali,
  "d_m-non": d_m_non,
  "d_m-oqituvchi": d_m_oqituvchi,
  "d_m-osh": d_m_osh,
  "d_m-qollar": d_m_qollar,
  "d_m-salom": d_m_salom,
  "d_m-hammom": d_m_hammom,
  "d_m-mehmonxona": d_m_mehmonxona,
  "d_m-ostida": d_m_ostida,
  "d_m-ostida-tagida": d_m_ostida_tagida,
  "d_m-otish": d_m_otish,
  "d_m-payshanba": d_m_payshanba,
  "d_m-penal": d_m_penal,
  "d_m-pijama": d_m_pijama,
  "d_m-piyola": d_m_piyola,
  "d_m-qayerda": d_m_qayerda,
  "d_m-qila-olaman-bilaman": d_m_qila_olaman_bilaman,
  "d_m-qila-olasanmi-bilasanmi": d_m_qila_olasanmi_bilasanmi,
  "d_m-qila-olmaydi": d_m_qila_olmaydi,
  "d_m-qila-olmoq": d_m_qila_olmoq,
  "d_m-qongiz": d_m_qongiz,
  "d_m-qorqinchli": d_m_qorqinchli,
  "d_m-qorqqan": d_m_qorqqan,
  "d_m-qorqyapman": d_m_qorqyapman,
  "d_m-qoshiq": d_m_qoshiq,
  "d_m-qoshuv": d_m_qoshuv,
  "d_m-qoshuv-plyus": d_m_qoshuv_plyus,
  "d_m-qogoz": d_m_qogoz,
  "d_m-qor-yogyapti": d_m_qor_yogyapti,
  "d_m-qorni-och": d_m_qorni_och,
  "d_m-quchoq": d_m_quchoq,
  "d_m-quchoqla": d_m_quchoqla,
  "d_m-quchoqlash": d_m_quchoqlash,
  "d_m-quti": d_m_quti,
  "d_m-radio": d_m_radio,
  "d_m-sana": d_m_sana,
  "d_m-sanamoq": d_m_sanamoq,
  "d_m-sen-qila-olasanmi": d_m_sen_qila_olasanmi,
  "d_m-sen-olasan": d_m_sen_olasan,
  "d_m-sen-olasanmi": d_m_sen_olasanmi,
  "d_m-sening": d_m_sening,
  "d_m-seshanba": d_m_seshanba,
  "d_m-shamol-esyapti": d_m_shamol_esyapti,
  "d_en67-u16-it-was-fun": d_en67_u16_it_was_fun,
  "d_en67-u16-we-went-to-the-zoo": d_en67_u16_we_went_to_the_zoo,
  "d_en67-u16-what-did-you-do-yesterday": d_en67_u16_what_did_you_do_yesterday,
  "d_en67-u17-chest": d_en67_u17_chest,
  "d_en67-u17-diploma": d_en67_u17_diploma,
  "d_en67-u17-forest": d_en67_u17_forest,
  "d_en67-u17-graduation": d_en67_u17_graduation,
  "d_en67-u17-help-me": d_en67_u17_help_me,
  "d_en67-u17-hooray": d_en67_u17_hooray,
  "d_en67-u17-im-ready-for-school": d_en67_u17_im_ready_for_school,
  "d_en67-u17-mouse": d_en67_u17_mouse,
  "d_en67-u17-net": d_en67_u17_net,
  "d_en67-u17-pull-pull-pull": d_en67_u17_pull_pull_pull,
  "d_en67-u17-she-is-kind": d_en67_u17_she_is_kind,
  "d_en67-u17-she-is-lazy": d_en67_u17_she_is_lazy,
  "d_en67-u17-thank-you-little-mouse": d_en67_u17_thank_you_little_mouse,
  "d_en67-u17-turnip": d_en67_u17_turnip,
  "d_en67-u17-we-did-it": d_en67_u17_we_did_it,
  "d_en67-u2-evening": d_en67_u2_evening,
  "d_en67-u2-friday": d_en67_u2_friday,
  "d_en67-u2-monday": d_en67_u2_monday,
  "d_en67-u2-morning": d_en67_u2_morning,
  "d_en67-u2-night": d_en67_u2_night,
  "d_en67-u2-saturday": d_en67_u2_saturday,
  "d_en67-u2-sunday": d_en67_u2_sunday,
  "d_en67-u2-thursday": d_en67_u2_thursday,
  "d_en67-u2-today-is": d_en67_u2_today_is,
  "d_en67-u2-tomorrow": d_en67_u2_tomorrow,
  "d_en67-u2-tuesday": d_en67_u2_tuesday,
  "d_en67-u2-wednesday": d_en67_u2_wednesday,
  "d_en67-u2-week": d_en67_u2_week,
  "d_en67-u2-weekend": d_en67_u2_weekend,
  "d_en67-u2-what-day": d_en67_u2_what_day,
  "d_en67-u3-builder": d_en67_u3_builder,
  "d_en67-u3-cook": d_en67_u3_cook,
  "d_en67-u3-doctor": d_en67_u3_doctor,
  "d_en67-u3-farm": d_en67_u3_farm,
  "d_en67-u3-farmer": d_en67_u3_farmer,
  "d_en67-u3-firefighter": d_en67_u3_firefighter,
  "d_en67-u3-he-is-doctor": d_en67_u3_he_is_doctor,
  "d_en67-u3-hospital": d_en67_u3_hospital,
  "d_en67-u3-pilot": d_en67_u3_pilot,
  "d_en67-u3-police-officer": d_en67_u3_police_officer,
  "d_en67-u3-school": d_en67_u3_school,
  "d_en67-u3-she-is-teacher": d_en67_u3_she_is_teacher,
  "d_en67-u3-shop": d_en67_u3_shop,
  "d_en67-u3-teacher": d_en67_u3_teacher,
  "d_en67-u3-want-pilot": d_en67_u3_want_pilot,
  "d_en67-u3-want-to-be": d_en67_u3_want_to_be,
  "d_en67-u4-ambulance": d_en67_u4_ambulance,
  "d_en67-u4-bike": d_en67_u4_bike,
  "d_en67-u4-boat": d_en67_u4_boat,
  "d_en67-u4-bus": d_en67_u4_bus,
  "d_en67-u4-car": d_en67_u4_car,
  "d_en67-u4-fire-engine": d_en67_u4_fire_engine,
  "d_en67-u4-go-by-bus": d_en67_u4_go_by_bus,
  "d_en67-u4-helicopter": d_en67_u4_helicopter,
  "d_en67-u4-how-go-school": d_en67_u4_how_go_school,
  "d_en67-u4-i-walk": d_en67_u4_i_walk,
  "d_en67-u4-plane": d_en67_u4_plane,
  "d_en67-u4-police-car": d_en67_u4_police_car,
  "d_en67-u4-ship": d_en67_u4_ship,
  "d_en67-u4-stop": d_en67_u4_stop,
  "d_en67-u4-taxi": d_en67_u4_taxi,
  "d_en67-u4-train": d_en67_u4_train,
  "d_en67-u5-be-quiet": d_en67_u5_be_quiet,
  "d_en67-u5-book": d_en67_u5_book,
  "d_en67-u5-close-book": d_en67_u5_close_book,
  "d_en67-u5-crayons": d_en67_u5_crayons,
  "d_en67-u5-listen": d_en67_u5_listen,
  "d_en67-u5-look": d_en67_u5_look,
  "d_en67-u5-notebook": d_en67_u5_notebook,
  "d_en67-u5-open-book": d_en67_u5_open_book,
  "d_en67-u5-pen": d_en67_u5_pen,
  "d_en67-u5-pencil": d_en67_u5_pencil,
  "d_en67-u5-raise-hand": d_en67_u5_raise_hand,
  "d_en67-u5-ruler": d_en67_u5_ruler,
  "d_en67-u5-school-bag": d_en67_u5_school_bag,
  "d_en67-u5-scissors": d_en67_u5_scissors,
  "d_en67-u5-sit-down": d_en67_u5_sit_down,
  "d_en67-u5-stand-up": d_en67_u5_stand_up,
  "d_en67-u6-bird-fly": d_en67_u6_bird_fly,
  "d_en67-u6-can-you-swim": d_en67_u6_can_you_swim,
  "d_en67-u6-climb": d_en67_u6_climb,
  "d_en67-u6-fish-swim": d_en67_u6_fish_swim,
  "d_en67-u6-frog-jump": d_en67_u6_frog_jump,
  "d_en67-u6-help-me": d_en67_u6_help_me,
  "d_en67-u6-lets-play": d_en67_u6_lets_play,
  "d_en67-u6-no-i-cant": d_en67_u6_no_i_cant,
  "d_en67-u6-of-course": d_en67_u6_of_course,
  "d_en67-u6-play-football": d_en67_u6_play_football,
  "d_en67-u6-ride-bike": d_en67_u6_ride_bike,
  "d_en67-u6-skate": d_en67_u6_skate,
  "d_en67-u6-snake-cant-walk": d_en67_u6_snake_cant_walk,
  "d_en67-u6-well-done": d_en67_u6_well_done,
  "d_en67-u6-yes-i-can": d_en67_u6_yes_i_can,
  "d_en67-u7-apple-please": d_en67_u7_apple_please,
  "d_en67-u7-basket": d_en67_u7_basket,
  "d_en67-u7-can-i-help": d_en67_u7_can_i_help,
  "d_en67-u7-carrots": d_en67_u7_carrots,
  "d_en56-u8-have-ball": d_en56_u8_have_ball,
  "d_en56-u8-have-cat": d_en56_u8_have_cat,
  "d_en56-u8-have-dog": d_en56_u8_have_dog,
  "d_en56-u8-have-doll": d_en56_u8_have_doll,
  "d_en56-u8-i-am-big": d_en56_u8_i_am_big,
  "d_en56-u8-i-am-five": d_en56_u8_i_am_five,
  "d_en56-u8-see-you-soon": d_en56_u8_see_you_soon,
  "d_en67-s1-counting-eggs": d_en67_s1_counting_eggs,
  "d_en67-s18-time-for-school": d_en67_s18_time_for_school,
  "d_en67-s19-at-the-clinic": d_en67_s19_at_the_clinic,
  "d_en67-s2-planning-week": d_en67_s2_planning_week,
  "d_en67-s20-way-to-the-zoo": d_en67_s20_way_to_the_zoo,
  "d_en67-s21-grandmas-visit": d_en67_s21_grandmas_visit,
  "d_en67-s22-phone-call-now": d_en67_s22_phone_call_now,
  "d_en67-s23-monday-morning": d_en67_s23_monday_morning,
  "d_en67-s24-new-teacher": d_en67_s24_new_teacher,
  "d_en67-s3-at-the-doctor": d_en67_s3_at_the_doctor,
  "d_en67-s4-bus-ride": d_en67_s4_bus_ride,
  "d_en67-s5-first-day-school": d_en67_s5_first_day_school,
  "d_en67-s6-sports-day": d_en67_s6_sports_day,
  "d_en67-s7-shopping-list": d_en67_s7_shopping_list,
  "d_en67-s8-phone-call": d_en67_s8_phone_call,
  "d_en67-u1-eighteen": d_en67_u1_eighteen,
  "d_en67-u1-eleven": d_en67_u1_eleven,
  "d_en67-u1-fifteen-cats": d_en67_u1_fifteen_cats,
  "d_en67-u1-fifteen": d_en67_u1_fifteen,
  "d_en67-u1-fourteen": d_en67_u1_fourteen,
  "d_en67-u1-how-many": d_en67_u1_how_many,
  "d_en67-u1-lets-count": d_en67_u1_lets_count,
  "d_en67-u1-nineteen": d_en67_u1_nineteen,
  "d_en67-u1-seventeen": d_en67_u1_seventeen,
  "d_en67-u1-sixteen": d_en67_u1_sixteen,
  "d_en67-u1-thirteen": d_en67_u1_thirteen,
  "d_en67-u1-twelve": d_en67_u1_twelve,
  "d_en67-u1-twenty-stars": d_en67_u1_twenty_stars,
  "d_en67-u1-twenty": d_en67_u1_twenty,
  "d_en67-u11-i-do-my-homework": d_en67_u11_i_do_my_homework,
  "d_en67-u11-i-get-dressed": d_en67_u11_i_get_dressed,
  "d_en67-u11-i-get-up": d_en67_u11_i_get_up,
  "d_en67-u11-i-go-to-school": d_en67_u11_i_go_to_school,
  "d_en67-u11-i-have-breakfast": d_en67_u11_i_have_breakfast,
  "d_en67-u11-i-have-lunch": d_en67_u11_i_have_lunch,
  "d_en67-u11-i-play-with-friends": d_en67_u11_i_play_with_friends,
  "d_en67-u11-i-wash-my-face": d_en67_u11_i_wash_my_face,
  "d_en67-u11-i-watch-tv": d_en67_u11_i_watch_tv,
  "d_en67-u11-im-reading": d_en67_u11_im_reading,
  "d_en67-u11-its-half-past-seven": d_en67_u11_its_half_past_seven,
  "d_en67-u11-its-seven-oclock": d_en67_u11_its_seven_oclock,
  "d_en67-u11-shes-singing": d_en67_u11_shes_singing,
  "d_en67-u11-the-fish-is-swimming": d_en67_u11_the_fish_is_swimming,
  "d_en67-u11-traffic-light": d_en67_u11_traffic_light,
  "d_en67-u11-watch": d_en67_u11_watch,
  "d_en67-u11-what-time-is-it": d_en67_u11_what_time_is_it,
  "d_en67-u12-drink-water": d_en67_u12_drink_water,
  "d_en67-u12-eat-fruit": d_en67_u12_eat_fruit,
  "d_en67-u12-get-well-soon": d_en67_u12_get_well_soon,
  "d_en67-u12-i-have-a-headache": d_en67_u12_i_have_a_headache,
  "d_en67-u12-i-have-a-stomachache": d_en67_u12_i_have_a_stomachache,
  "d_en67-u12-im-sick": d_en67_u12_im_sick,
  "d_en67-u12-medicine": d_en67_u12_medicine,
  "d_en67-u12-nurse": d_en67_u12_nurse,
  "d_en67-u12-sleep-well": d_en67_u12_sleep_well,
  "d_en67-u12-thermometer": d_en67_u12_thermometer,
  "d_en67-u12-whats-the-matter": d_en67_u12_whats_the_matter,
  "d_en67-u13-bakery": d_en67_u13_bakery,
  "d_en67-u13-behind": d_en67_u13_behind,
  "d_en67-u13-bus-stop": d_en67_u13_bus_stop,
  "d_en67-u13-crossing": d_en67_u13_crossing,
  "d_en67-u13-go-straight": d_en67_u13_go_straight,
  "d_en67-u13-in-front-of": d_en67_u13_in_front_of,
  "d_en67-u13-library": d_en67_u13_library,
  "d_en67-u13-look-left-and-right": d_en67_u13_look_left_and_right,
  "d_en67-u13-next-to": d_en67_u13_next_to,
  "d_en67-u13-park": d_en67_u13_park,
  "d_en67-u13-turn-left": d_en67_u13_turn_left,
  "d_en67-u13-turn-right": d_en67_u13_turn_right,
  "d_en67-u13-wait": d_en67_u13_wait,
  "d_en67-u13-where-is-the-park": d_en67_u13_where_is_the_park,
  "d_en67-u13-zoo": d_en67_u13_zoo,
  "d_en67-u14-bowl": d_en67_u14_bowl,
  "d_en67-u14-cup": d_en67_u14_cup,
  "d_en67-u14-cut": d_en67_u14_cut,
  "d_en67-u14-fork": d_en67_u14_fork,
  "d_en67-u14-its-delicious": d_en67_u14_its_delicious,
  "d_en67-u14-lets-make-a-salad": d_en67_u14_lets_make_a_salad,
  "d_en67-u14-mix": d_en67_u14_mix,
  "d_en67-u14-plate": d_en67_u14_plate,
  "d_en67-u14-spoon": d_en67_u14_spoon,
  "d_en67-u14-would-you-like-some-tea": d_en67_u14_would_you_like_some_tea,
  "d_en67-u15-im-playing": d_en67_u15_im_playing,
  "d_en67-u15-the-birds-are-singing": d_en67_u15_the_birds_are_singing,
  "d_en67-u15-the-cat-is-sleeping": d_en67_u15_the_cat_is_sleeping,
  "d_en67-u15-the-dog-is-running": d_en67_u15_the_dog_is_running,
  "d_en67-u15-theyre-running": d_en67_u15_theyre_running,
  "d_en67-u15-what-are-you-doing": d_en67_u15_what_are_you_doing,
  "d_en67-u16-i-ate-ice-cream": d_en67_u16_i_ate_ice_cream,
  "d_en67-u16-i-saw-a-big-dog": d_en67_u16_i_saw_a_big_dog,
  "d_en67-u16-i-saw-a-rainbow": d_en67_u16_i_saw_a_rainbow,
  "d_en67-u16-i-visited-my-granny": d_en67_u16_i_visited_my_granny,
  "d_en67-u16-i-went-to-the-park": d_en67_u16_i_went_to_the_park,
  "d_en67-u7-eggs": d_en67_u7_eggs,
  "d_en67-u7-five-bananas": d_en67_u7_five_bananas,
  "d_en67-u7-goodbye-see-you": d_en67_u7_goodbye_see_you,
  "d_en67-u7-how-many-bananas": d_en67_u7_how_many_bananas,
  "d_en67-u7-money": d_en67_u7_money,
  "d_en67-u7-potatoes": d_en67_u7_potatoes,
  "d_en67-u7-thank-you": d_en67_u7_thank_you,
  "d_en67-u7-tomatoes": d_en67_u7_tomatoes,
  "d_en67-u8-favourite-green": d_en67_u8_favourite_green,
  "d_en67-u8-favourite-plov": d_en67_u8_favourite_plov,
  "d_en67-u8-from-uzbekistan": d_en67_u8_from_uzbekistan,
  "d_en67-u8-have-pet": d_en67_u8_have_pet,
  "d_en67-u8-have-sister": d_en67_u8_have_sister,
  "d_en67-u8-how-old": d_en67_u8_how_old,
  "d_en67-u8-i-am-seven": d_en67_u8_i_am_seven,
  "d_en67-u8-i-am-six": d_en67_u8_i_am_six,
  "d_en67-u8-like-football": d_en67_u8_like_football,
  "d_en67-u8-live-samarkand": d_en67_u8_live_samarkand,
  "d_en67-u8-my-name-is": d_en67_u8_my_name_is,
  "d_en67-u8-nice-to-meet": d_en67_u8_nice_to_meet,
  "d_en67-u8-this-is-me": d_en67_u8_this_is_me,
  "d_en67-u8-what-like": d_en67_u8_what_like,
  "d_en67-u8-where-live": d_en67_u8_where_live,
  "d_mt56-u1-count-rule": d_mt56_u1_count_rule,
  "d_mt56-u1-number-line": d_mt56_u1_number_line,
  "d_mt56-u1-zero": d_mt56_u1_zero,
  "d_mt56-u2-count-ten": d_mt56_u2_count_ten,
  "d_mt56-u2-equal": d_mt56_u2_equal,
  "d_mt56-u2-few": d_mt56_u2_few,
  "d_mt56-u3-before": d_mt56_u3_before,
  "d_mt56-u3-count-back": d_mt56_u3_count_back,
  "d_mt56-u3-gap": d_mt56_u3_gap,
  "d_mt56-u3-middle": d_mt56_u3_middle,
  "d_mt56-u3-neighbors": d_mt56_u3_neighbors,
  "d_mt56-u3-next": d_mt56_u3_next,
  "d_mt56-u3-one-less": d_mt56_u3_one_less,
  "d_mt56-u3-rocket": d_mt56_u3_rocket,
  "d_mt56-u3-ten-to-zero": d_mt56_u3_ten_to_zero,
  "d_mt56-u4-eight-parts": d_mt56_u4_eight_parts,
  "d_mt56-u4-five-five": d_mt56_u4_five_five,
  "d_mt56-u4-five-parts": d_mt56_u4_five_parts,
  "d_mt56-u4-four-parts": d_mt56_u4_four_parts,
  "d_mt56-u4-nine-parts": d_mt56_u4_nine_parts,
  "d_mt56-u4-seven-parts": d_mt56_u4_seven_parts,
  "d_mt56-u4-six-parts": d_mt56_u4_six_parts,
  "d_mt56-u4-ten-friends": d_mt56_u4_ten_friends,
  "d_mt56-u4-three-parts": d_mt56_u4_three_parts,
  "d_mt56-u5-build-shapes": d_mt56_u5_build_shapes,
  "d_mt56-u5-cone": d_mt56_u5_cone,
  "d_mt56-u5-cube": d_mt56_u5_cube,
  "d_mt56-u5-cylinder": d_mt56_u5_cylinder,
  "d_mt56-u5-home-shapes": d_mt56_u5_home_shapes,
  "d_mt56-u5-rolling": d_mt56_u5_rolling,
  "d_mt56-u5-standing": d_mt56_u5_standing,
  "d_mt56-u6-season-circle": d_mt56_u6_season_circle,
  "d_mt56-u6-seven-days": d_mt56_u6_seven_days,
  "d_mt56-u6-thu-fri": d_mt56_u6_thu_fri,
  "d_mt56-u6-tue-wed": d_mt56_u6_tue_wed,
  "d_mt56-u6-weekend": d_mt56_u6_weekend,
  "d_mt56-u6-yesterday-tomorrow": d_mt56_u6_yesterday_tomorrow,
  "d_mt56-u7-align": d_mt56_u7_align,
  "d_mt56-u7-far": d_mt56_u7_far,
  "d_mt56-u7-heavy": d_mt56_u7_heavy,
  "d_mt56-u7-light": d_mt56_u7_light,
  "d_mt56-u7-lines": d_mt56_u7_lines,
  "d_mt56-u7-short": d_mt56_u7_short,
  "d_mt56-u7-span": d_mt56_u7_span,
  "d_mt56-u7-step-size": d_mt56_u7_step_size,
  "d_mt56-u7-step": d_mt56_u7_step,
  "d_mt56-u7-string": d_mt56_u7_string,
  "d_mt56-u8-arrow": d_mt56_u8_arrow,
  "d_mt56-u8-group": d_mt56_u8_group,
  "d_mt56-u8-maze": d_mt56_u8_maze,
  "d_mt56-u8-number-pattern": d_mt56_u8_number_pattern,
  "d_mt56-u8-odd-one": d_mt56_u8_odd_one,
  "d_mt56-u8-path": d_mt56_u8_path,
  "d_mt56-u8-pattern": d_mt56_u8_pattern,
  "d_mt56-u8-up-down": d_mt56_u8_up_down,
  "d_mt56-u8-whats-next": d_mt56_u8_whats_next,
  "d_mt67-u1-count-twenty": d_mt67_u1_count_twenty,
  "d_mt67-u1-eighteen": d_mt67_u1_eighteen,
  "d_mt67-u1-eleven": d_mt67_u1_eleven,
  "d_mt67-u1-fifteen": d_mt67_u1_fifteen,
  "d_mt67-u1-fourteen": d_mt67_u1_fourteen,
  "d_mt67-u1-nineteen": d_mt67_u1_nineteen,
  "d_mt67-u1-seventeen": d_mt67_u1_seventeen,
  "d_mt67-u1-sixteen": d_mt67_u1_sixteen,
  "d_mt67-u1-ten-bundle": d_mt67_u1_ten_bundle,
  "d_mt67-u1-thirteen": d_mt67_u1_thirteen,
  "d_mt67-u1-twelve": d_mt67_u1_twelve,
  "d_mt67-u2-adding": d_mt67_u2_adding,
  "d_mt67-u2-count-on": d_mt67_u2_count_on,
  "d_mt67-u2-equals": d_mt67_u2_equals,
  "d_mt67-u2-fingers": d_mt67_u2_fingers,
  "d_mt67-u2-make-ten": d_mt67_u2_make_ten,
  "d_mt67-u2-picture-sum": d_mt67_u2_picture_sum,
  "d_mt67-u2-plus-one": d_mt67_u2_plus_one,
  "d_mt67-u2-plus-zero": d_mt67_u2_plus_zero,
  "d_mt67-u2-plus": d_mt67_u2_plus,
  "d_mt67-u2-swap": d_mt67_u2_swap,
  "d_y-clockwise-rightwards-and-leftwards-open-circle-arrows": d_y_clockwise_rightwards_and_leftwards_open_circle_arrows,
  "d_y-heavy-black-heart": d_y_heavy_black_heart,
  "d_y-clapping-hands-sign": d_y_clapping_hands_sign,
  "d_y-black-rightwards-arrow": d_y_black_rightwards_arrow,
  "d_y-thinking-face": d_y_thinking_face,
  "d_y-performing-arts": d_y_performing_arts,
  "d_y-thumbs-up-sign": d_y_thumbs_up_sign,
  "d_y-input-symbol-for-numbers": d_y_input_symbol_for_numbers,
  "d_y-handshake": d_y_handshake,
  "d_y-raised-hand": d_y_raised_hand,
  "d_y-elephant": d_y_elephant,
  "d_y-upwards-black-arrow": d_y_upwards_black_arrow,
  "d_y-leftwards-black-arrow": d_y_leftwards_black_arrow,
  "d_y-pilot": d_y_pilot,
  "d_y-basketball-and-hoop": d_y_basketball_and_hoop,
  "d_y-heavy-minus-sign": d_y_heavy_minus_sign,
  "d_y-farmer": d_y_farmer,
  "d_y-sun-with-face": d_y_sun_with_face,
  "d_y-open-hands-sign": d_y_open_hands_sign,
  "d_y-raised-hand-with-fingers-splayed": d_y_raised_hand_with_fingers_splayed,
  "d_y-no-entry-sign": d_y_no_entry_sign,
  "d_y-beach-with-umbrella": d_y_beach_with_umbrella,
  "d_y-train": d_y_train,
  "d_y-spider": d_y_spider,
  "d_y-multiple-musical-notes": d_y_multiple_musical_notes,
  "d_y-sparkles": d_y_sparkles,
  "d_y-cow": d_y_cow,
  "d_y-snowman-without-snow": d_y_snowman_without_snow,
  "d_y-heart-with-ribbon": d_y_heart_with_ribbon,
  "d_y-railway-car": d_y_railway_car,
  "d_y-left-pointing-magnifying-glass": d_y_left_pointing_magnifying_glass,
  "d_y-jigsaw-puzzle-piece": d_y_jigsaw_puzzle_piece,
  "d_y-downwards-black-arrow": d_y_downwards_black_arrow,
  "d_y-heavy-plus-sign": d_y_heavy_plus_sign,
  "d_y-anticlockwise-downwards-and-upwards-open-circle-arrows": d_y_anticlockwise_downwards_and_upwards_open_circle_arrows,
  "d_y-trophy": d_y_trophy,
  "d_y-goal-net": d_y_goal_net,
  "d_y-rabbit": d_y_rabbit,
  "d_y-raised-back-of-hand": d_y_raised_back_of_hand,
  "d_y-back-with-leftwards-arrow-above": d_y_back_with_leftwards_arrow_above,
  "d_y-heavy-equals-sign": d_y_heavy_equals_sign,
  "d_y-heavy-large-circle": d_y_heavy_large_circle,
  "d_y-juggling": d_y_juggling,
  "d_y-family": d_y_family,
  "d_y-horse": d_y_horse,
  "d_y-black-large-square": d_y_black_large_square,
  "d_y-white-left-pointing-backhand-index": d_y_white_left_pointing_backhand_index,
  "d_y-microscope": d_y_microscope,
  "d_y-black-square-button": d_y_black_square_button,
  "d_y-white-hexagon": d_y_white_hexagon,
  "d_y-sleuth-or-spy": d_y_sleuth_or_spy,
  "d_y-new-moon-symbol": d_y_new_moon_symbol,
  "d_y-chopsticks": d_y_chopsticks,
  "d_y-victory-hand": d_y_victory_hand,
  "d_y-black-pentagon": d_y_black_pentagon,
  "d_y-umbrella-with-rain-drops": d_y_umbrella_with_rain_drops,
  "d_y-shortcake": d_y_shortcake,
  "d_y-white-down-pointing-backhand-index": d_y_white_down_pointing_backhand_index,
  "d_y-shopping-bags": d_y_shopping_bags,
  "d_y-horse-racing": d_y_horse_racing,
  "d_y-face-with-stuck-out-tongue-and-tightly-closed-eyes": d_y_face_with_stuck_out_tongue_and_tightly_closed_eyes,
  "d_y-white-up-pointing-backhand-index": d_y_white_up_pointing_backhand_index,
  "d_y-speaking-head-in-silhouette": d_y_speaking_head_in_silhouette,
  "d_y-chains": d_y_chains,
  "d_y-mechanic": d_y_mechanic,
  "d_y-face-with-open-mouth": d_y_face_with_open_mouth,
  "d_y-white-chess-knight": d_y_white_chess_knight,
  "d_y-hammer-and-wrench": d_y_hammer_and_wrench,
  "d_y-white-chess-rook": d_y_white_chess_rook,
  "d_y-thong-sandal": d_y_thong_sandal,
  "d_y-face-without-mouth": d_y_face_without_mouth,
  "d_y-face-with-tears-of-joy": d_y_face_with_tears_of_joy,
  "d_y-chequered-flag": d_y_chequered_flag,
  "d_y-white-chess-bishop": d_y_white_chess_bishop,
  "d_y-large-blue-diamond": d_y_large_blue_diamond,
  "d_y-tennis-racquet-and-ball": d_y_tennis_racquet_and_ball,
  "d_y-bar-chart": d_y_bar_chart,
  "d_y-hair-pick": d_y_hair_pick,
  "d_y-top-hat": d_y_top_hat,
  "d_y-clipboard": d_y_clipboard,
  "d_y-black-chess-pawn": d_y_black_chess_pawn,
  "d_y-grinning-face-with-one-large-and-one-small-eye": d_y_grinning_face_with_one_large_and_one_small_eye,
  "d_y-raised-hand-with-part-between-middle-and-ring-fingers": d_y_raised_hand_with_part_between_middle_and_ring_fingers,
  "d_y-womans-clothes": d_y_womans_clothes,
  "d_y-battery": d_y_battery,
  "d_y-twisted-rightwards-arrows": d_y_twisted_rightwards_arrows,
  "d_y-polar-bear": d_y_polar_bear,
  "d_y-curly-loop": d_y_curly_loop,
  "d_y-persevering-face": d_y_persevering_face,
  "d_y-pirate-flag": d_y_pirate_flag,
  "d_y-christmas-tree": d_y_christmas_tree,
  "d_y-open-lock": d_y_open_lock,
  "d_y-white-chess-king": d_y_white_chess_king,
  "d_y-palm-down-hand": d_y_palm_down_hand,
  "d_y-candle": d_y_candle,
  "d_y-hot-dog": d_y_hot_dog,
  "d_y-woman-with-bunny-ears": d_y_woman_with_bunny_ears,
  "d_y-file-cabinet": d_y_file_cabinet,
  "d_y-lab-coat": d_y_lab_coat,
  "d_y-toolbox": d_y_toolbox,
  "d_y-no-mobile-phones": d_y_no_mobile_phones,
  "d_y-tired-face": d_y_tired_face,
  "d_y-disappointed-face": d_y_disappointed_face,
  "d_y-white-chess-queen": d_y_white_chess_queen,
  "d_y-white-chess-pawn": d_y_white_chess_pawn,
  "d_y-heavy-multiplication-x": d_y_heavy_multiplication_x,
  "d_y-shield": d_y_shield,
  "d_y-hammer": d_y_hammer,
  "d_y-carpentry-saw": d_y_carpentry_saw,
  "d_y-grinning-face-with-smiling-eyes": d_y_grinning_face_with_smiling_eyes,
  "d_y-upside-down-face": d_y_upside_down_face,
  "d_y-mans-shoe": d_y_mans_shoe,
  "d_y-radio-button": d_y_radio_button,
  "d_y-circus-tent": d_y_circus_tent,
  "d_y-end-with-leftwards-arrow-above": d_y_end_with_leftwards_arrow_above,
  "d_y-recreational-vehicle": d_y_recreational_vehicle,
  "d_y-heavy-exclamation-mark-symbol": d_y_heavy_exclamation_mark_symbol,
  "d_y-building-construction": d_y_building_construction,
  "d_y-amphora": d_y_amphora,
  "d_y-single-block": d_y_single_block,
  "d_y-single-sock": d_y_single_sock,
  "d_y-single-sneaker": d_y_single_sneaker,
  "d_y-single-glove": d_y_single_glove,
  "d_y-single-coin": d_y_single_coin,
  "d_y-single-cherry": d_y_single_cherry,
  "d_y-single-grape": d_y_single_grape,
  "d_y-grape-bunch": d_y_grape_bunch,
  "d_y-single-colored-pencil": d_y_single_colored_pencil,
  "d_y-single-stick": d_y_single_stick,
  "d_y-whole-leg": d_y_whole_leg,
  "d_y-single-chair": d_y_single_chair,
  "d_y-question-mark": d_y_question_mark,
  "d_y-check-mark": d_y_check_mark,
  "d_y-cross-mark": d_y_cross_mark,
  "d_y-number-2-swan": d_y_number_2_swan,
  "d_y-number-3-bird": d_y_number_3_bird,
  "d_y-number-1-card": d_y_number_1_card,
  "d_y-number-2-card": d_y_number_2_card,
  "d_y-number-3-card": d_y_number_3_card,
  "d_y-single-boy": d_y_single_boy,
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
